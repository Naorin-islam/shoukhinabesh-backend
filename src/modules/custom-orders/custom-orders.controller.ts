import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomOrdersService } from './custom-orders.service';
import { CreateCustomOrderDto, UpdateCustomOrderAdminDto } from './dto/custom-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

@ApiTags('Custom Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('custom-orders')
export class CustomOrdersController {
  constructor(private readonly customOrdersService: CustomOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new custom order request' })
  create(@Request() req: any, @Body() dto: CreateCustomOrderDto) {
    return this.customOrdersService.create(req.user.id, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user custom orders' })
  findMine(@Request() req: any) {
    return this.customOrdersService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Get all custom orders (Admin/Seller)' })
  findAllAdmin() {
    return this.customOrdersService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom order details' })
  findOne(@Param('id') id: string) {
    return this.customOrdersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Update custom order status (Admin/Seller)' })
  updateByAdmin(@Param('id') id: string, @Body() dto: UpdateCustomOrderAdminDto) {
    return this.customOrdersService.updateByAdmin(id, dto);
  }
}
