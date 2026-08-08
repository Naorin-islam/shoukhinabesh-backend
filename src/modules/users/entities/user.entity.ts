import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole, IUser } from '../../../shared';
import { Address } from './address.entity';

/**
 * User Entity
 * Core TypeORM entity representing authenticated users (Customers, Sellers, and Administrators).
 * Automatically excludes sensitive cryptographic hashes when serialized to JSON.
 */
@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ name: 'profile_photo', type: 'varchar', length: 500, nullable: true })
  profilePhoto?: string;

  @Column({
    type: 'simple-array',
    default: UserRole.CUSTOMER,
  })
  roles: UserRole[];

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken?: string;

  @OneToMany(() => Address, address => address.user, { cascade: true })
  addresses: Address[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
