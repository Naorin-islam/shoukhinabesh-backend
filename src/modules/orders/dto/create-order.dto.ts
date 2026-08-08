import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '../../../shared';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreateOrderDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD, description: 'Selected payment method: COD or SSLCOMMERZ' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: ShippingAddressDto, description: 'Customer shipping destination details' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ type: ShippingAddressDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  billingAddress?: ShippingAddressDto;

  @ApiProperty({ example: 'HERITAGE10', required: false, description: 'Applied promotional coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ example: 'Please package carefully as a bridal gift.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
