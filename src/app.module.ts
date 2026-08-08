import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BannersModule } from './modules/banners/banners.module';
import { CustomOrdersModule } from './modules/custom-orders/custom-orders.module';
import { SellerModule } from './modules/seller/seller.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadsModule } from './modules/uploads/uploads.module';

/**
 * AppModule
 * Root architectural module aggregating all infrastructure connectors and feature sub-modules.
 */
@Module({
  imports: [
    // Asynchronous Configuration setup using .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Async TypeORM Postgres Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    // Feature Modules
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    CartModule,
    WishlistModule,
    InventoryModule,
    ShippingModule,
    PaymentsModule,
    CouponsModule,
    NotificationsModule,
    BannersModule,
    CustomOrdersModule,
    SellerModule,
    AdminModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [
    // Register global exception filter to guarantee standard IApiResponse error structure
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Register global response interceptor for uniform JSON serialization
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
