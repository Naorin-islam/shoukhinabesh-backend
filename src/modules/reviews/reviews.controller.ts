import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Reviews Controller
 * Manages fetching public product rating reviews and handling verified customer feedback postings.
 */
@ApiTags('Product Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Retrieve verified buyer reviews and photos for a specific craft listing' })
  @ApiResponse({ status: 200, description: 'Return array of reviews with author profile metadata' })
  async getReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit rating stars and commentary (Gated to Verified Buyers)' })
  @ApiResponse({ status: 201, description: 'Review posted and aggregate product rating updated' })
  async createReview(
    @Request() req: any,
    @Body() body: { productId: string; rating: number; comment: string; image?: string },
  ) {
    return this.reviewsService.addReview(req.user.id, body.productId, body.rating, body.comment, body.image);
  }
}
