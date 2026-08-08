import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ILike } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { CreateProductDto, FilterProductDto } from '../dto/create-product.dto';
import { IPaginatedResponse } from '../../../shared';

/**
 * Products Service
 * Orchestrates catalog search filtering, autocomplete suggestions, category querying, and inventory updates.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  /**
   * Create new product listing with generated URL-safe slug
   */
  async createProduct(dto: CreateProductDto, imageUrls: string[], thumbnail: string): Promise<Product> {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existingSku = await this.productRepository.findOne({ where: [{ sku: dto.sku }, { slug }] });
    if (existingSku) {
      throw new ConflictException('Product with matching SKU or identical name slug already exists');
    }

    const product = this.productRepository.create({
      ...dto,
      slug,
      images: imageUrls,
      thumbnail,
      tags: dto.tags || [],
      isNewArrival: dto.isNewArrival ?? true,
    });

    return this.productRepository.save(product);
  }

  /**
   * Retrieve paginated products with dynamic slider and keyword filtering
   */
  async findAllPaginated(query: FilterProductDto): Promise<IPaginatedResponse<Product>> {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const qb: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory');

    if (query.search) {
      qb.andWhere('(product.name ILIKE :search OR product.description ILIKE :search OR product.brand ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.category) {
      qb.andWhere('(category.slug = :category OR category.id::text = :category)', {
        category: query.category,
      });
    }

    if (query.minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.color) {
      qb.andWhere('product.color ILIKE :color', { color: `%${query.color}%` });
    }

    // Apply sorting logic
    switch (query.sort) {
      case 'priceAsc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'priceDesc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'popular':
        qb.orderBy('product.rating', 'DESC').addOrderBy('product.reviewCount', 'DESC');
        break;
      case 'bestSeller':
        qb.orderBy('product.isBestSeller', 'DESC').addOrderBy('product.createdAt', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    qb.skip(skip).take(limit);
    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      message: 'Retrieved catalog listings successfully',
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Real-time debounced search autocomplete suggestions
   */
  async getLiveSearchSuggestions(term: string): Promise<Array<{ id: string; name: string; slug: string; thumbnail: string; price: number; categoryName: string }>> {
    if (!term || term.trim().length < 2) return [];

    const matches = await this.productRepository.find({
      where: [
        { name: ILike(`%${term}%`) },
        { brand: ILike(`%${term}%`) },
      ],
      relations: ['category'],
      take: 6,
      order: { isBestSeller: 'DESC', rating: 'DESC' },
    });

    return matches.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.thumbnail,
      price: p.discountPrice || p.price,
      categoryName: p.category?.name || 'Handcrafted',
    }));
  }

  /**
   * Find detailed single craft listing by unique slug
   */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'subCategory'],
    });

    if (!product) {
      throw new NotFoundException(`Craft item with handle '${slug}' could not be found`);
    }
    return product;
  }

  /**
   * Retrieve complete hierarchical category tree
   */
  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['subCategories'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Decrement stock quantity after confirmed checkout
   */
  async decrementStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (product && product.stock >= quantity) {
      product.stock -= quantity;
      await this.productRepository.save(product);
    }
  }
}
