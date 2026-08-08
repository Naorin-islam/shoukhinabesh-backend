import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'The UUID of the product to add to cart' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity to add', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Selected size variant if applicable' })
  @IsOptional()
  @IsString()
  selectedSize?: string;

  @ApiPropertyOptional({ description: 'Selected color variant if applicable' })
  @IsOptional()
  @IsString()
  selectedColor?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'The new quantity for the cart item', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
