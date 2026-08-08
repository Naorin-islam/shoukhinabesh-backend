import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  async getMyProducts(sellerId: string): Promise<Product[]> {
    return this.productRepo.find({ where: { sellerId } });
  }

  async getMyDashboardStats(sellerId: string) {
    const products = await this.getMyProducts(sellerId);
    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return { totalProducts: 0, totalSales: 0, totalRevenue: 0 };
    }

    const qb = this.orderItemRepo.createQueryBuilder('oi')
      .where('oi.product_id IN (:...productIds)', { productIds })
      .select('SUM(oi.quantity)', 'totalSales')
      .addSelect('SUM(oi.price * oi.quantity)', 'totalRevenue');

    const result = await qb.getRawOne();

    return {
      totalProducts: products.length,
      totalSales: parseInt(result.totalSales || '0', 10),
      totalRevenue: parseFloat(result.totalRevenue || '0'),
    };
  }
}
