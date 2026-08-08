import { Controller, Get, Post, Param, Delete, UseGuards, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  @ApiResponse({ status: 200, description: 'Return all bookmarked products.' })
  getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product successfully added.' })
  addProduct(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.addProduct(req.user.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 204, description: 'Product successfully removed.' })
  removeProduct(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeProduct(req.user.id, productId);
  }
}
