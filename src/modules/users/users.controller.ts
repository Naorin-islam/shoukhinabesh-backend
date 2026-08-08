import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Request, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Users Controller
 * Manages authenticated user profile inspection and personal address book updates.
 */
@ApiTags('Users & Profiles')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current authenticated user profile and addresses' })
  @ApiResponse({ status: 200, description: 'Return full profile sans cryptographic hashes' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Modify user name, contact telephone, or avatar URI' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req: any, @Body() updatePayload: { name?: string; phone?: string; profilePhoto?: string }) {
    return this.usersService.updateProfile(req.user.id, updatePayload);
  }

  // --- Address Management Endpoints ---

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new shipping/billing address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async addAddress(@Request() req: any, @Body() addressData: any) {
    return this.usersService.addAddress(req.user.id, addressData);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update an existing address' })
  async updateAddress(@Request() req: any, @Param('id') addressId: string, @Body() addressData: any) {
    return this.usersService.updateAddress(req.user.id, addressId, addressData);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  async deleteAddress(@Request() req: any, @Param('id') addressId: string) {
    return this.usersService.deleteAddress(req.user.id, addressId);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set an address as default shipping or billing' })
  async setDefaultAddress(
    @Request() req: any, 
    @Param('id') addressId: string, 
    @Body('type') type: 'shipping' | 'billing'
  ) {
    return this.usersService.setDefaultAddress(req.user.id, addressId, type);
  }
}
