import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SSLCommerzService } from './services/sslcommerz.service';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';

/**
 * OrdersModule
 * Comprehensive fulfillment engine unifying Shopping Cart calculations, Promotional Coupons,
 * Wishlist transitions, deterministic Order State Machine pipelines, and SSLCommerz payments.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    AuthModule,
    CartModule,
  ],
  controllers: [OrdersController, AnalyticsController],
  providers: [SSLCommerzService, OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
