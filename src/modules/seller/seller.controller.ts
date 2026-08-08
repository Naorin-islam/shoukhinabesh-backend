import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

@ApiTags('Seller Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all products belonging to the logged in seller' })
  getMyProducts(@Request() req: any) {
    return this.sellerService.getMyProducts(req.user.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get sales and revenue stats for the seller' })
  getDashboardStats(@Request() req: any) {
    return this.sellerService.getMyDashboardStats(req.user.id);
  }
}
