import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
  ) {}

  async getActiveBanners(): Promise<Banner[]> {
    return this.bannerRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getAllBanners(): Promise<Banner[]> {
    return this.bannerRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepo.create(dto);
    return this.bannerRepo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bannerRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Banner not found');
  }
}
