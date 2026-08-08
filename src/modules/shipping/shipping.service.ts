import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingConfig } from './entities/shipping-config.entity';
import { CreateShippingConfigDto, UpdateShippingConfigDto } from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingConfig)
    private shippingRepo: Repository<ShippingConfig>,
  ) {}

  async findAllActive(): Promise<ShippingConfig[]> {
    return this.shippingRepo.find({ where: { isActive: true } });
  }

  async findAllAdmin(): Promise<ShippingConfig[]> {
    return this.shippingRepo.find();
  }

  async create(dto: CreateShippingConfigDto): Promise<ShippingConfig> {
    const config = this.shippingRepo.create(dto);
    return this.shippingRepo.save(config);
  }

  async update(id: string, dto: UpdateShippingConfigDto): Promise<ShippingConfig> {
    const config = await this.shippingRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException('Shipping config not found');

    Object.assign(config, dto);
    return this.shippingRepo.save(config);
  }

  async remove(id: string): Promise<void> {
    const result = await this.shippingRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Shipping config not found');
  }
}
