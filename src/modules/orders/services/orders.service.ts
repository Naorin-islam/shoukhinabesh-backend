import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CartService } from '../../cart/cart.service';
import { SSLCommerzService } from './sslcommerz.service';
import { ProductsService } from '../../products/services/products.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus, PaymentStatus, PaymentMethod, UserRole } from '../../../shared';

/**
 * Orders Service
 * Orchestrates deterministic Order Fulfillment State Machine transitions, coordinates inventory reduction,
 * invokes SSLCommerz gateways, and produces formatted order confirmation ledgers.
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly sslcommerzService: SSLCommerzService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Generate human-readable time-ordered transaction tracking IDs (e.g. SHK-ORD-202608-4912)
   */
  private generateOrderNumber(): string {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SHK-ORD-${timestamp}-${randomSuffix}`;
  }

  /**
   * Place Order from user shopping cart
   */
  async createOrder(userId: string, userEmail: string, userName: string, dto: CreateOrderDto): Promise<{ order: Order; paymentGatewayUrl?: string }> {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot initiate checkout with an empty shopping cart');
    }

    const orderNumber = this.generateOrderNumber();
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate subtotals
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += Number(item.product.price) * item.quantity;
    });
    
    // In a real app, apply dto.couponCode here via CouponsService
    const discountAmount = 0; 
    const shippingCharge = 60; // Hardcoded or fetch from ShippingService
    const tax = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal - discountAmount + shippingCharge + tax;

    const order = this.orderRepository.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      transactionId,
      shippingAddressId: `ship-${Date.now()}`,
      shippingAddress: dto.shippingAddress,
      billingAddressId: `bill-${Date.now()}`,
      billingAddress: dto.billingAddress || dto.shippingAddress,
      subtotal,
      discountAmount,
      shippingCharge,
      tax,
      totalAmount,
      notes: dto.notes,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create immutable order line items and decrement product inventory
    const orderItems = cart.items.map((cartItem) => {
      this.productsService.decrementStock(cartItem.productId, cartItem.quantity);
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        selectedColor: cartItem.selectedColor,
        selectedSize: cartItem.selectedSize,
        unitPrice: Number(cartItem.product.price),
        price: Number(cartItem.product.price),
        totalPrice: Number(cartItem.product.price) * cartItem.quantity,
      });
    });

    await this.orderItemRepository.save(orderItems);
    await this.cartService.clearCart(userId);

    let paymentGatewayUrl: string | undefined = undefined;

    // Invoke SSLCommerz gateway if electronic payment option was selected
    if (dto.paymentMethod === PaymentMethod.SSLCOMMERZ || (dto.paymentMethod as string) === 'SSLCOMMERZ') {
      const initResult = await this.sslcommerzService.initPayment({
        transactionId,
        amount: Number(savedOrder.totalAmount),
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: dto.shippingAddress.phone,
        customerAddress: `${dto.shippingAddress.street}, ${dto.shippingAddress.city}`,
        orderId: savedOrder.id,
      });
      paymentGatewayUrl = initResult.gatewayUrl;
    }

    const completeOrder = await this.getOrderById(savedOrder.id);
    return { order: completeOrder, paymentGatewayUrl };
  }

  /**
   * Deterministic Order State Machine Enforcement
   * Prevents invalid or contradictory sequence leaps (e.g., jumping from DELIVERED back to PENDING)
   */
  async updateOrderStatus(orderId: string, nextStatus: OrderStatus, userRoles: UserRole[]): Promise<Order> {
    const order = await this.getOrderById(orderId);
    const currentStatus = order.status;

    if (currentStatus === nextStatus) return order;

    // Enforce immutable transition hierarchy
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED], // Terminal state or refund
      [OrderStatus.CANCELLED]: [], // Terminal state
      [OrderStatus.REFUNDED]: [],  // Terminal state
    };

    if (!validTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `State Machine Violation: Cannot transition order from '${currentStatus}' to '${nextStatus}'`
      );
    }

    // Update order status and set payment to PAID if COD item arrives safely at DELIVERED state
    order.status = nextStatus;
    if (nextStatus === OrderStatus.DELIVERED && (order.paymentMethod === PaymentMethod.COD || (order.paymentMethod as string) === 'COD')) {
      order.paymentStatus = PaymentStatus.PAID;
    }

    return this.orderRepository.save(order);
  }

  /**
   * Handle SSLCommerz Gateway Instant Payment Notification success webhook
   */
  async confirmSslCommerzPayment(orderId: string, valId: string, tranId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);
    const isValid = await this.sslcommerzService.validateValidationResponse(valId);

    if (isValid) {
      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.PROCESSING; // Advance state from PENDING directly to PROCESSING
      this.logger.log(`Payment confirmed for Order #${order.orderNumber} via SSLCommerz (TranID: ${tranId})`);
      return this.orderRepository.save(order);
    } else {
      order.paymentStatus = PaymentStatus.FAILED;
      return this.orderRepository.save(order);
    }
  }

  /**
   * Retrieve single order by UUID with populated relations
   */
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.product', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order record with reference ${orderId} was not found`);
    }
    return order;
  }

  /**
   * Retrieve all historical order records belonging to an individual customer
   */
  async getCustomerOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieve comprehensive orders across the entire platform for Artisan Sellers & Administrators
   */
  async getPlatformOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
