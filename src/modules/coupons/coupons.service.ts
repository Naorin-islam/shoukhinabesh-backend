import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    if (!dto.discountPercentage && !dto.discountAmount) {
      throw new BadRequestException('Must provide either discountPercentage or discountAmount');
    }

    const coupon = this.couponRepo.create(dto);
    return this.couponRepo.save(coupon);
  }

  async validateCoupon(dto: ValidateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { code: dto.code, isActive: true } });
    
    if (!coupon) {
      throw new NotFoundException('Invalid or inactive coupon');
    }

    if (new Date() > new Date(coupon.expirationDate)) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (dto.orderAmount < coupon.minPurchaseAmount) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minPurchaseAmount} required`);
    }

    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Coupon not found');
    }
  }

  async recordUsage(id: string): Promise<void> {
    await this.couponRepo.increment({ id }, 'usedCount', 1);
  }
}
