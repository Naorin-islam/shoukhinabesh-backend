import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { ProductsService } from './services/products.service';
import { CloudinaryService } from './services/cloudinary.service';
import { ProductsController } from './products.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * ProductsModule
 * Integrates Product, Category, and SubCategory database repositories with Cloudinary media infrastructure.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, SubCategory]),
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
