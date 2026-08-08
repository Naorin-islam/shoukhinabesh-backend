import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { IOrder, OrderStatus, PaymentStatus, PaymentMethod } from '../../../shared';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

/**
 * Order Entity
 * Core fulfillment ledger tracking transaction statuses, payment gate IDs,
 * shipping destinations, and deterministic lifecycle states.
 */
@Entity('orders')
export class Order implements IOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'order_number', type: 'varchar', length: 60, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  orderItems: OrderItem[];

  // Backward compatibility alias for views expecting .items
  get items(): OrderItem[] {
    return this.orderItems;
  }
  set items(val: OrderItem[]) {
    this.orderItems = val;
  }

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.COD })
  paymentMethod: PaymentMethod;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true })
  transactionId?: string;

  @Column({ name: 'shipping_address_id', type: 'varchar', length: 100, default: 'default_shipping_id' })
  shippingAddressId: string;

  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: any;

  @Column({ name: 'billing_address_id', type: 'varchar', length: 100, default: 'default_billing_id' })
  billingAddressId: string;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress?: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'shipping_charge', type: 'decimal', precision: 10, scale: 2, default: 120 })
  shippingCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
