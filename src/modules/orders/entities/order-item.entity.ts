import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IOrderItem } from '../../../shared';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * OrderItem Entity
 * Immutable line item record captured during checkout to freeze historical price and product specifications.
 */
@Entity('order_items')
export class OrderItem implements IOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'selected_color', type: 'varchar', length: 50, nullable: true })
  selectedColor?: string;

  @Column({ name: 'selected_size', type: 'varchar', length: 50, nullable: true })
  selectedSize?: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;
}
