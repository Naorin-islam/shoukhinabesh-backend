import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async banUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = true;
    return this.userRepo.save(user);
  }

  async getSystemAnalytics() {
    const totalUsers = await this.userRepo.count();
    const totalProducts = await this.productRepo.count();
    const totalOrders = await this.orderRepo.count();
    
    const revenueQuery = await this.orderRepo.createQueryBuilder('o')
      .where("o.status NOT IN ('CANCELLED', 'REFUNDED')")
      .select('SUM(o.total_amount)', 'total')
      .getRawOne();
      
    const totalRevenue = parseFloat(revenueQuery.total || '0');

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    };
  }
}
