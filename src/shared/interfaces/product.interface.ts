import { CategoryType } from '../enums/category-type.enum';

/**
 * Category Interface
 * Hierarchical structure for classifying handmade craft catalogs.
 */
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  subCategories?: ISubCategory[];
  createdAt: string | Date;
}

/**
 * SubCategory Interface
 * More granular refinement under parent category (e.g. Jamdani Saree under Saree).
 */
export interface ISubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  createdAt: string | Date;
}

/**
 * Product Interface
 * Comprehensive data model for artisan products featuring luxury attributes and inventory metrics.
 */
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  brand?: string;
  categoryId: string;
  category?: ICategory;
  subCategoryId?: string;
  subCategory?: ISubCategory;
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  material?: string;
  weight?: number; // in grams
  size?: string;
  color?: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Review Interface
 * Verified customer feedback item attached to a product.
 */
export interface IReview {
  id: string;
  userId: string;
  productId: string;
  userName?: string;
  userPhoto?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  photos: string[];
  isVerifiedPurchase: boolean;
  likes: number;
  isReported: boolean;
  createdAt: string | Date;
}

/**
 * Wishlist Item Interface
 * Favorite craft bookmarked by a user for future consideration.
 */
export interface IWishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: IProduct;
  createdAt: string | Date;
}
