import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IProduct } from '../../../shared';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';

/**
 * Product Entity
 * Complete architectural relational representation of a handmade artisan product.
 * Houses pricing metrics, multi-image galleries, material inventory weights, and SEO identifiers.
 */
@Entity('products')
export class Product implements IProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'long_description', type: 'text', nullable: true })
  longDescription?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'discount_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Column({ type: 'int', default: 1 })
  stock: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 100, default: 'Shoukhinabesh Artisan Council' })
  brand?: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'sub_category_id', type: 'uuid', nullable: true })
  subCategoryId?: string;

  @ManyToOne(() => SubCategory, { onDelete: 'SET NULL', eager: true, nullable: true })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory?: SubCategory;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId?: string;

  @Column('simple-array')
  images: string[];

  @Column({ type: 'varchar', length: 500 })
  thumbnail: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.8 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  material?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number; // Grams

  @Column({ type: 'varchar', length: 50, nullable: true })
  size?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Index()
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Index()
  @Column({ name: 'is_best_seller', type: 'boolean', default: false })
  isBestSeller: boolean;

  @Index()
  @Column({ name: 'is_trending', type: 'boolean', default: false })
  isTrending: boolean;

  @Column({ name: 'is_new_arrival', type: 'boolean', default: true })
  isNewArrival: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
