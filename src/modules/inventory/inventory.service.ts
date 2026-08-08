import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InventoryTransaction, InventoryTransactionType } from './entities/inventory-transaction.entity';
import { Product } from '../products/entities/product.entity';
import { AdjustInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private inventoryRepo: Repository<InventoryTransaction>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async adjustInventory(userId: string, dto: AdjustInventoryDto): Promise<InventoryTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const previousStock = product.stock;
      let newStock = previousStock;

      if (dto.type === InventoryTransactionType.ADD) {
        newStock += dto.quantity;
      } else if (dto.type === InventoryTransactionType.SUBTRACT) {
        newStock -= dto.quantity;
      } else if (dto.type === InventoryTransactionType.SET) {
        newStock = dto.quantity;
      }

      if (newStock < 0) {
        throw new BadRequestException('Inventory cannot be negative');
      }

      product.stock = newStock;
      await queryRunner.manager.save(product);

      const transaction = this.inventoryRepo.create({
        productId: dto.productId,
        type: dto.type,
        quantity: dto.quantity,
        previousStock,
        newStock,
        reason: dto.reason,
        performedById: userId,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductHistory(productId: string): Promise<InventoryTransaction[]> {
    return this.inventoryRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
      relations: ['performedBy'],
    });
  }
}
