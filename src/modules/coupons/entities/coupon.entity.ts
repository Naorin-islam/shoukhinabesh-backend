import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ICoupon } from '../../../shared';

/**
 * Coupon Entity
 * Represents promotional discount codes for marketing campaigns.
 * Evaluated dynamically by the pricing engine during cart and checkout processing.
 */
@Entity('coupons')
export class Coupon implements ICoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage?: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ name: 'min_purchase_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minPurchaseAmount: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ name: 'expiration_date', type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'usage_limit', type: 'int', default: 100 })
  usageLimit: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
