import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

@ApiTags('Admin Portal')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user from the platform' })
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('analytics/system')
  @ApiOperation({ summary: 'Get system-wide analytics' })
  getSystemAnalytics() {
    return this.adminService.getSystemAnalytics();
  }
}
