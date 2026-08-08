import { IsUUID, IsEnum, IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryTransactionType } from '../entities/inventory-transaction.entity';

export class AdjustInventoryDto {
  @ApiProperty({ description: 'UUID of the product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ enum: InventoryTransactionType })
  @IsEnum(InventoryTransactionType)
  type: InventoryTransactionType;

  @ApiProperty({ description: 'Quantity to change', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Reason for inventory adjustment' })
  @IsString()
  reason: string;
}
