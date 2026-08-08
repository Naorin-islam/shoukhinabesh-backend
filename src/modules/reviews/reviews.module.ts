import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

/**
 * ReviewsModule
 * Links verified customer order line items to product catalog rating aggregates.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    OrdersModule,
    ProductsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
