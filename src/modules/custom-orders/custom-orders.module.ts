import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrdersController } from './custom-orders.controller';
import { CustomOrder } from './entities/custom-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomOrder])],
  controllers: [CustomOrdersController],
  providers: [CustomOrdersService],
  exports: [CustomOrdersService],
})
export class CustomOrdersModule {}
