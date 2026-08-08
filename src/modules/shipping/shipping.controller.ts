import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingConfigDto, UpdateShippingConfigDto } from './dto/shipping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active shipping configurations for checkout' })
  getActive() {
    return this.shippingService.findAllActive();
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all shipping configurations (Admin only)' })
  getAll() {
    return this.shippingService.findAllAdmin();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new shipping configuration (Admin only)' })
  create(@Body() dto: CreateShippingConfigDto) {
    return this.shippingService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update shipping configuration (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateShippingConfigDto) {
    return this.shippingService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete shipping configuration (Admin only)' })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}
