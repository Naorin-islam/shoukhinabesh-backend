import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './services/products.service';
import { CloudinaryService } from './services/cloudinary.service';
import { CreateProductDto, FilterProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';

/**
 * Products Controller
 * Handles public catalog browsing, live autocomplete search requests, and protected 
 * artisan storefront item uploads.
 */
@ApiTags('Products & Catalog')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated product catalog with price slider & attribute filters' })
  @ApiResponse({ status: 200, description: 'Returned filtered catalog with paginated metadata' })
  async getProducts(@Query() query: FilterProductDto) {
    return this.productsService.findAllPaginated(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Real-time live autocomplete search suggestions' })
  @ApiQuery({ name: 'term', example: 'Jamdani', description: 'Search query keyword string' })
  @ApiResponse({ status: 200, description: 'Return top matching craft summary items' })
  async liveSearch(@Query('term') term: string) {
    return this.productsService.getLiveSearchSuggestions(term);
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Retrieve full category & subcategory tree architecture' })
  @ApiResponse({ status: 200, description: 'Returns hierarchical categories' })
  async getCategories() {
    return this.productsService.findAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve extensive craft specifications by URL slug' })
  @ApiResponse({ status: 200, description: 'Returned product specifications and gallery media' })
  @ApiResponse({ status: 404, description: 'Slug not matched' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create new product listing with up to 5 uploaded Cloudinary images (Sellers & Admins only)' })
  @ApiResponse({ status: 201, description: 'Product item created and media archived to Cloudinary' })
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one authentic craft image must be attached during listing creation');
    }

    const imageUrls = await this.cloudinaryService.uploadMultipleImages(files, 'shoukhinabesh/products');
    const thumbnail = imageUrls[0]; // Set initial image as high-performance catalog thumbnail

    return this.productsService.createProduct(dto, imageUrls, thumbnail);
  }
}
