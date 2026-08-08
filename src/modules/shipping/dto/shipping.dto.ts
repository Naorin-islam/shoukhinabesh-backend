import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingConfigDto {
  @ApiProperty({ example: 'Inside Dhaka' })
  @IsString()
  @IsNotEmpty()
  regionName: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateShippingConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regionName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
