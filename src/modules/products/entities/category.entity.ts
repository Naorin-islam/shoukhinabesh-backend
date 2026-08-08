import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { ICategory } from '../../../shared';
import { SubCategory } from './sub-category.entity';

/**
 * Category Entity
 * Relational database model representing core artisan product domains (Saree, Panjabi, Jewellery, etc.).
 * Supports multi-tier subcategories via cascading OneToMany relations.
 */
@Entity('categories')
export class Category implements ICategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail?: string;

  @OneToMany(() => SubCategory, subCategory => subCategory.category, { cascade: true })
  subCategories?: SubCategory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
