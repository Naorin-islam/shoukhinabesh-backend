import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum InventoryTransactionType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  SET = 'SET',
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'enum', enum: InventoryTransactionType })
  type: InventoryTransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'previous_stock', type: 'int' })
  previousStock: number;

  @Column({ name: 'new_stock', type: 'int' })
  newStock: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ name: 'performed_by_id', type: 'uuid' })
  performedById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
