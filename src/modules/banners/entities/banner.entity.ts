import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle?: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ name: 'button_text', type: 'varchar', length: 50, nullable: true })
  buttonText?: string;

  @Column({ name: 'button_link', type: 'varchar', length: 255, nullable: true })
  buttonLink?: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  endDate?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
