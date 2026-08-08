import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/order-status.enum';
import { IProduct } from './product.interface';
import { IAddress } from './user.interface';

/**
 * OrderItem Interface
 * Individual snapshot of a purchased product inside an order.
 */
export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: IProduct;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice?: number;
  price: number; // Unit price at the time of purchase
  totalPrice: number; // quantity * price
}

/**
 * Order Interface
 * Complete record of a customer checkout operation with billing details and fulfillment tracking.
 */
export interface IOrder {
  id: string;
  userId: string;
  user?: any;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressId: string;
  shippingAddress?: any;
  billingAddressId: string;
  billingAddress?: any;
  orderItems: IOrderItem[];
  items?: IOrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Coupon Interface
 * Promotional code capable of applying percentage or fixed monetary discounts.
 */
export interface ICoupon {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  expirationDate: string | Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

/**
 * Cart Item Interface
 * Represents an item either residing in local session memory (Zustand) or persisted on the server.
 */
export interface ICartItem {
  id: string;
  productId: string;
  product?: IProduct;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
}

/**
 * Shopping Cart Interface
 */
export interface ICart {
  id?: string;
  userId?: string;
  items: ICartItem[];
  appliedCoupon?: ICoupon;
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  tax: number;
  total: number;
}
