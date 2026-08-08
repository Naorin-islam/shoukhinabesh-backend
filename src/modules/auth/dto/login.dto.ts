import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login Data Transfer Object (DTO)
 * Ensures required credentials are present prior to initiating bcrypt hash verification.
 */
export class LoginDto {
  @ApiProperty({ example: 'customer@shoukhinabesh.com', description: 'Account registered email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd2026', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
