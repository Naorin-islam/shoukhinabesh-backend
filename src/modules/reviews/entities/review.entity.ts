import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IReview } from '../../../shared';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * Review Entity
 * Represents authentic customer feedback and photo ratings, strictly gated to verified purchasers.
 */
@Entity('reviews')
export class Review implements IReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userName?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userPhoto?: string;

  @Column({ type: 'int' })
  rating: number; // 1 to 5 Star Rating

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ name: 'is_verified_purchase', type: 'boolean', default: true })
  isVerifiedPurchase: boolean;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ name: 'is_reported', type: 'boolean', default: false })
  isReported: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
