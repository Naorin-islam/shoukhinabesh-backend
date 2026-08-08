import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * TypeORM Database Configuration Factory
 * Generates connection arguments for PostgreSQL (local or Neon serverless DB).
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USER', 'postgres'),
  password: configService.get<string>('DATABASE_PASSWORD', 'secret'),
  database: configService.get<string>('DATABASE_NAME', 'shoukhinabesh'),
  ssl: configService.get<string>('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
  synchronize: configService.get<string>('NODE_ENV') !== 'production', // Automatically synchronize ER schema in development
  logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
});
