import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap Application Entry Point
 * Initializes NestJS runtime, binds security headers (Helmet, CORS),
 * sets up validation pipes, and compiles OpenAPI Swagger docs.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Apply Security Headers via Helmet
  app.use(helmet());

  // Enable CORS for frontend Next.js application
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe for strict DTO payload validation and type coercion
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties without decorators
      forbidNonWhitelisted: true, // Throw error if extra unrecognized parameters arrive
      transform: true, // Auto-convert incoming payloads to DTO instance types
    }),
  );

  // Set universal API prefix for clean domain structure
  app.setGlobalPrefix('api/v1');

  // Configure interactive Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('শৌখিনাবেশ (Shoukhinabesh) REST API')
    .setDescription('Production eCommerce REST API architecture for handmade artisan crafts')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Access Token to authorize protected REST operations',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Shoukhinabesh API Docs',
    customCss: '.swagger-ui .topbar { background-color: #8B4513; }', // Primary brand saddle brown
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 Shoukhinabesh API Server launched successfully on http://localhost:${port}/api/v1`);
  logger.log(`📚 Interactive Swagger API documentation accessible at http://localhost:${port}/api/docs`);
}

bootstrap();
