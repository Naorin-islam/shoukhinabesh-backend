import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller
 * Exposes public registration/login endpoints and protected session management endpoints.
 */
@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer, seller, or administrative account' })
  @ApiResponse({ status: 201, description: 'Account created successfully; returns JWT session tokens' })
  @ApiResponse({ status: 409, description: 'Email address already present in database' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user account and issue JWT token pair' })
  @ApiResponse({ status: 200, description: 'Authentication successful; returns user profile & tokens' })
  @ApiResponse({ status: 401, description: 'Invalid email or password credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active refresh token and end user session' })
  @ApiResponse({ status: 200, description: 'Session successfully revoked' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request fresh JWT access token via valid rotation refresh token' })
  @ApiResponse({ status: 200, description: 'Returned fresh token pair' })
  async refreshTokens(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
