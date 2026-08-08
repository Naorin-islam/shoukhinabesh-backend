import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IAddress } from '../../../shared';
import { User } from './user.entity';

/**
 * Address Entity
 * Represents user shipping and billing destination coordinates.
 * Configured with relational cascades back to the parent User account.
 */
@Entity('addresses')
export class Address implements IAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ name: 'street_address', type: 'varchar', length: 255 })
  streetAddress: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20 })
  postalCode: string;

  @Column({ type: 'varchar', length: 60, default: 'Bangladesh' })
  country: string;

  @Column({ name: 'is_default_shipping', type: 'boolean', default: false })
  isDefaultShipping: boolean;

  @Column({ name: 'is_default_billing', type: 'boolean', default: false })
  isDefaultBilling: boolean;
}
