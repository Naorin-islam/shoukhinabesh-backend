import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared';

/**
 * Register Data Transfer Object (DTO)
 * Validates formatting, minimum security entropy for passwords, and structural integrity of signup payloads.
 */
export class RegisterDto {
  @ApiProperty({ example: 'customer@shoukhinabesh.com', description: 'Unique user email address' })
  @IsEmail({}, { message: 'Please provide a valid email address structure' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Shoukhinabesh Artisan', description: 'Full human-readable name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'StrongP@ssw0rd2026', description: 'Account password (minimum 8 chars)' })
  @IsString()
  @MinLength(8, { message: 'Password entropy must exceed 8 characters in length' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '+8801700000000', required: false, description: 'Bangladeshi contact mobile number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
