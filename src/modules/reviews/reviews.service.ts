import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from '../../shared';

/**
 * Reviews Service
 * Ensures feedback rating integrity by restricting submissions strictly to verified buyers
 * who have completed deliveries of the targeted artisan product.
 */
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Submit new review after confirming verified purchase qualification
   */
  async addReview(userId: string, productId: string, rating: number, comment: string, image?: string): Promise<Review> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating value must fall within a 1 to 5 star range');
    }

    // Check if user has previously submitted a review for this specific item
    const existingReview = await this.reviewRepository.findOne({ where: { userId, productId } });
    if (existingReview) {
      throw new BadRequestException('You have already contributed a verified review for this craft product');
    }

    // Validate that user actually ordered and received this item
    const purchasedItem = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_id = :productId', { productId })
      .andWhere('order.status IN (:...statuses)', { statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING, OrderStatus.PENDING, OrderStatus.CONFIRMED] })
      .getOne();

    if (!purchasedItem) {
      throw new BadRequestException('Only verified buyers who purchased this specific craft can submit ratings and photo reviews');
    }

    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
      photos: image ? [image] : [],
      isVerifiedPurchase: true,
      likes: 0,
      isReported: false,
    });
    await this.reviewRepository.save(review);

    // Recompute product aggregate average rating and review counter
    await this.updateProductRating(productId);
    return review;
  }

  /**
   * Recalculate average star rating and total count for target product
   */
  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({ where: { productId } });
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
      const avg = Number((sum / reviews.length).toFixed(2));
      await this.productRepository.update(productId, { rating: avg, reviewCount: reviews.length });
    }
  }

  /**
   * Fetch all published reviews for an individual artisan product
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
