import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomOrder } from './entities/custom-order.entity';
import { CreateCustomOrderDto, UpdateCustomOrderAdminDto } from './dto/custom-order.dto';

@Injectable()
export class CustomOrdersService {
  constructor(
    @InjectRepository(CustomOrder)
    private customOrderRepo: Repository<CustomOrder>,
  ) {}

  async create(userId: string, dto: CreateCustomOrderDto): Promise<CustomOrder> {
    const order = this.customOrderRepo.create({ ...dto, userId });
    return this.customOrderRepo.save(order);
  }

  async findByUser(userId: string): Promise<CustomOrder[]> {
    return this.customOrderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAllAdmin(): Promise<CustomOrder[]> {
    return this.customOrderRepo.find({ order: { createdAt: 'DESC' }, relations: ['user'] });
  }

  async findOne(id: string): Promise<CustomOrder> {
    const order = await this.customOrderRepo.findOne({ where: { id }, relations: ['user'] });
    if (!order) throw new NotFoundException('Custom order not found');
    return order;
  }

  async updateByAdmin(id: string, dto: UpdateCustomOrderAdminDto): Promise<CustomOrder> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.customOrderRepo.save(order);
  }
}
