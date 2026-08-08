import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CreateProductDto
 * Enforces validation contracts when Sellers or Administrators post new handmade items.
 */
export class CreateProductDto {
  @ApiProperty({ example: 'Authentic Handcrafted Jamdani Saree', description: 'Product title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Hand-loomed Jamdani saree with fine silver zari embroidery', description: 'Short summary' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Extended details about artisan heritage, care instructions, and weaving process.', required: false })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ example: 6500, description: 'Base retail price in Taka' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: 5800, required: false, description: 'Discounted promotional rate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPrice?: number;

  @ApiProperty({ example: 5, description: 'Initial stock available in artisan inventory' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'SHK-JAM-001', description: 'Unique stock keeping unit code' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Shoukhinabesh Heritage Loom', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'uuid-of-category', description: 'UUID of parent Category (Saree, Panjabi, etc.)' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'uuid-of-sub-category', required: false })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiProperty({ example: ['Handmade', 'Jamdani', 'Luxury', 'Saree'], required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(t => t.trim()) : value))
  tags?: string[];

  @ApiProperty({ example: 'Pure Resham Silk & Cotton Zari', required: false })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ example: 'Free Size (6.5 Yards with Blouse Piece)', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 'Crimson Red with Gold Zari', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isBestSeller?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isNewArrival?: boolean;
}

/**
 * FilterProductDto (Query parameters for filtering, sorting, and pagination)
 */
export class FilterProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'popular' | 'bestSeller' | 'priceAsc' | 'priceDesc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;
}
