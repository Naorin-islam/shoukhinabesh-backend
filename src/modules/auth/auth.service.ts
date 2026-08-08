import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IAuthResponse, IAuthTokens, UserRole } from '../../shared';

/**
 * AuthService
 * Handles cryptographic password verification, JWT access/refresh token signing,
 * and high-security session lifecycle operations.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user account with bcrypt password hashing
   */
  async register(registerDto: RegisterDto): Promise<IAuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email address is already registered');
    }

    // Hash password with cost factor 12
    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.createUser({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      phone: registerDto.phone,
      roles: registerDto.role ? [registerDto.role] : [UserRole.CUSTOMER],
    });

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.usersService.setCurrentRefreshToken(tokens.refreshToken!, user.id);

    this.logger.log(`New user registered successfully: ${user.email} (${user.id})`);

    // Return profile stripped of passwordHash
    const { passwordHash: _, refreshToken: __, ...userProfile } = user as any;
    return { user: userProfile, tokens };
  }

  /**
   * Authenticate credentials and issue session JWT tokens
   */
  async login(loginDto: LoginDto): Promise<IAuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid authentication credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid authentication credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.usersService.setCurrentRefreshToken(tokens.refreshToken!, user.id);

    const { passwordHash: _, refreshToken: __, ...userProfile } = user as any;
    return { user: userProfile, tokens };
  }

  /**
   * Terminate session by purging hashed refresh token from database
   */
  async logout(userId: string): Promise<{ success: boolean; message: string }> {
    await this.usersService.removeRefreshToken(userId);
    this.logger.log(`User terminated active session: ${userId}`);
    return { success: true, message: 'Successfully logged out and revoked refresh token' };
  }

  /**
   * Renew expired access token using validated rotation-enabled refresh token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<IAuthTokens> {
    const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, userId);
    if (!user) {
      throw new UnauthorizedException('Invalid or revoked refresh token presented');
    }

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.usersService.setCurrentRefreshToken(tokens.refreshToken!, user.id);
    return tokens;
  }

  /**
   * Internal utility to sign cryptographic JWT pairs
   */
  private async getTokens(userId: string, email: string, roles: UserRole[]): Promise<IAuthTokens> {
    const payload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_for_shoukhinabesh_luxury_platform_2026'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET', 'super_secret_refresh_token_key_for_rotation'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
