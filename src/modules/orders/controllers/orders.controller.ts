import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../shared';

/**
 * Orders Controller
 * Exposes customer checkout placement routes, order tracking histories, admin state transitions,
 * and SSLCommerz IPN verification redirection webhooks.
 */
@ApiTags('Order Fulfillment & Payments')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate order checkout and get gateway redirect URL or COD confirmation' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async placeOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, req.user.email, req.user.name, dto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get personal historical orders for authenticated customer' })
  @ApiResponse({ status: 200, description: 'Return array of historical order ledgers' })
  async getMyOrders(@Request() req: any) {
    return this.ordersService.getCustomerOrders(req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve global platform orders for fulfillment moderation (Admins & Sellers)' })
  @ApiResponse({ status: 200, description: 'Return complete system order log' })
  async getAllOrders() {
    return this.ordersService.getPlatformOrders();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve specific order details by ID' })
  @ApiResponse({ status: 200, description: 'Returned order items and shipping state' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Execute deterministic order state machine transition (e.g. PENDING -> PROCESSING -> SHIPPED)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully according to state rules' })
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status, req.user.roles);
  }

  // ==========================================
  // SSLCommerz Gateway Callback Webhooks
  // ==========================================
  @Post('sslcommerz/success')
  @ApiOperation({ summary: 'SSLCommerz IPN Success Webhook callback endpoint' })
  async sslcommerzSuccess(@Query('order_id') orderId: string, @Body() body: any, @Res() res: Response) {
    const valId = body.val_id || 'MOCK_SANDBOX_VALIDATION_ID';
    const tranId = body.tran_id || `TXN-${Date.now()}`;
    await this.ordersService.confirmSslCommerzPayment(orderId, valId, tranId);

    // Redirect customer browser directly to order success confirmation display
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/checkout/confirmation?order_id=${orderId}`);
  }

  @Post('sslcommerz/fail')
  @ApiOperation({ summary: 'SSLCommerz IPN Failure Webhook callback endpoint' })
  async sslcommerzFail(@Query('order_id') orderId: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/checkout?error=payment_failed`);
  }
}
