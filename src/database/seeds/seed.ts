import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/products/entities/category.entity';
import { SubCategory } from '../../modules/products/entities/sub-category.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { Coupon } from '../../modules/coupons/entities/coupon.entity';
import { UserRole, CategoryType } from '../../shared';

/**
 * Production & Academic Demonstration Seeder Script
 * Populates PostgreSQL database with realistic Bengali artisan categories, sample admin/seller accounts,
 * promotional discount codes, and handmade product items.
 */
async function bootstrap() {
  const logger = new Logger('Shoukhinabesh Seeder');
  logger.log('Initializing application context for database seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const subCategoryRepository = dataSource.getRepository(SubCategory);
  const productRepository = dataSource.getRepository(Product);
  const couponRepository = dataSource.getRepository(Coupon);

  try {
    // 1. Seed Core User Accounts (Admin, Artisan Seller, Customer)
    logger.log('Seeding user identities with bcrypt hashing...');
    const defaultPasswordHash = await bcrypt.hash('Shoukhin@2026', 12);

    const adminEmail = 'admin@shoukhinabesh.com';
    let admin = await userRepository.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = userRepository.create({
        email: adminEmail,
        passwordHash: defaultPasswordHash,
        name: 'Prof. Anisul Haque (Admin)',
        phone: '+8801711112222',
        roles: [UserRole.ADMIN, UserRole.CUSTOMER],
      });
      await userRepository.save(admin);
    }

    const sellerEmail = 'artisan@shoukhinabesh.com';
    let seller = await userRepository.findOne({ where: { email: sellerEmail } });
    if (!seller) {
      seller = userRepository.create({
        email: sellerEmail,
        passwordHash: defaultPasswordHash,
        name: 'Tangail Heritage Weavers Guild',
        phone: '+8801733334444',
        roles: [UserRole.SELLER],
      });
      await userRepository.save(seller);
    }

    // 2. Seed Artisan Product Categories
    logger.log('Seeding traditional handicraft categories...');
    const categoryNames = [
      { name: 'Saree', slug: 'saree', desc: 'Authentic Jamdani, Tangail Taant, and Rajshahi Silk Sarees.' },
      { name: 'Handmade Jewellery', slug: 'handmade-jewellery', desc: 'Clay, oxidized metallic, and floral terracotta ornaments.' },
      { name: 'Embroidery Dresses', slug: 'embroidery-dresses', desc: 'Intricate Nakshi Kantha and hand-stitched three-piece attire.' },
      { name: 'Panjabi', slug: 'panjabi', desc: 'Handloomed cotton and khadi festive men’s Panjabi.' },
      { name: 'Home Decoration', slug: 'home-decoration', desc: 'Cane furnishings, jute handicrafts, and painted pottery.' },
      { name: 'Gift Items', slug: 'gift-items', desc: 'Curated artisanal souvenir gift boxes and greeting scrolls.' },
    ];

    const savedCategories: Record<string, Category> = {};
    for (const cat of categoryNames) {
      let existing = await categoryRepository.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        existing = categoryRepository.create({ name: cat.name, slug: cat.slug, description: cat.desc });
        existing = await categoryRepository.save(existing);
      }
      savedCategories[cat.slug] = existing;
    }

    // 3. Seed Promotional Coupons
    logger.log('Seeding promotional discount coupons...');
    const coupons = [
      { code: 'HERITAGE10', percent: 10, minPurchase: 2000, maxDiscount: 1000, days: 60 },
      { code: 'ARTISAN20', percent: 20, minPurchase: 5000, maxDiscount: 2500, days: 90 },
      { code: 'WELCOME500', amount: 500, minPurchase: 1500, days: 30 },
    ];

    for (const c of coupons) {
      let existing = await couponRepository.findOne({ where: { code: c.code } });
      if (!existing) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + c.days);
        existing = couponRepository.create({
          code: c.code,
          discountPercentage: c.percent ? c.percent : undefined,
          discountAmount: c.amount ? c.amount : undefined,
          minPurchaseAmount: c.minPurchase,
          maxDiscountAmount: c.maxDiscount ? c.maxDiscount : undefined,
          expirationDate,
          isActive: true,
        });
        await couponRepository.save(existing);
      }
    }

    // 4. Seed Showcase Products
    logger.log('Seeding handloomed Jamdani sarees and terracotta crafts...');
    const sareeCategory = savedCategories['saree'] || Object.values(savedCategories)[0];
    const jewelleryCategory = savedCategories['handmade-jewellery'] || Object.values(savedCategories)[1];

    const sampleProducts = [
      {
        name: 'Midnight Blue Resham Jamdani Saree',
        slug: 'midnight-blue-resham-jamdani-saree',
        sku: 'SHK-SAR-101',
        price: 12500,
        discountPrice: 11000,
        stock: 8,
        category: sareeCategory,
        material: '100% Pure Resham Silk & Silver Zari',
        desc: 'Masterfully woven on traditional wooden handlooms in Narayanganj over 28 continuous days.',
        thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Terracotta Floral Choker & Earrings Set',
        slug: 'terracotta-floral-choker-earrings-set',
        sku: 'SHK-JEW-202',
        price: 1450,
        discountPrice: 1200,
        stock: 25,
        category: jewelleryCategory,
        material: 'River Clay & Non-Toxic Organic Acrylics',
        desc: 'Hand-sculpted clay ornaments kiln-baked and intricately hand-painted with timeless heritage motifs.',
        thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      },
    ];

    for (const prod of sampleProducts) {
      let existing = await productRepository.findOne({ where: { sku: prod.sku } });
      if (!existing && prod.category) {
        existing = productRepository.create({
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          price: prod.price,
          discountPrice: prod.discountPrice,
          stock: prod.stock,
          categoryId: prod.category.id,
          category: prod.category,
          material: prod.material,
          description: prod.desc,
          thumbnail: prod.thumbnail,
          images: [prod.thumbnail],
          isBestSeller: true,
          isFeatured: true,
        });
        await productRepository.save(existing);
      }
    }

    logger.log('✅ Database seeding execution finished successfully without warnings.');
  } catch (error: any) {
    logger.error(`Database seeding failed: ${error.message}`, error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
