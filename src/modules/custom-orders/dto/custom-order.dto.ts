import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomOrderStatus } from '../entities/custom-order.entity';

export class CreateCustomOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budget?: string;
}

export class UpdateCustomOrderAdminDto {
  @ApiPropertyOptional({ enum: CustomOrderStatus })
  @IsOptional()
  @IsEnum(CustomOrderStatus)
  status?: CustomOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;
}
