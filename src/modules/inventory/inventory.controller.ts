import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Adjust inventory stock for a product' })
  @ApiResponse({ status: 201, description: 'Inventory updated successfully.' })
  adjustInventory(@Request() req: any, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(req.user.id, dto);
  }

  @Get('product/:id/history')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'View the inventory transaction history of a product' })
  getProductHistory(@Param('id') productId: string) {
    return this.inventoryService.getProductHistory(productId);
  }
}
