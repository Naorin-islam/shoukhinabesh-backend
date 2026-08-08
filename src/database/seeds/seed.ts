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
    const embroideryCategory = savedCategories['embroidery-dresses'] || Object.values(savedCategories)[2];
    const panjabiCategory = savedCategories['panjabi'] || Object.values(savedCategories)[3];
    const homeDecorCategory = savedCategories['home-decoration'] || Object.values(savedCategories)[4];
    const giftCategory = savedCategories['gift-items'] || Object.values(savedCategories)[5];

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
        desc: 'Masterfully woven on traditional wooden handlooms in Narayanganj over 28 continuous days. Features exquisite geometric floral patterns that are authentic to Bengali heritage.',
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
        material: 'River Clay & Organic Acrylics',
        desc: 'Hand-sculpted clay ornaments kiln-baked and intricately hand-painted with timeless heritage motifs. Perfect for cultural events and Pohela Boishakh.',
        thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Crimson Red Tangail Silk Saree',
        slug: 'crimson-red-tangail-silk-saree',
        sku: 'SHK-SAR-103',
        price: 8500,
        discountPrice: 8000,
        stock: 12,
        category: sareeCategory,
        material: 'Tangail Pure Silk',
        desc: 'A gorgeous bright red Tangail silk saree with golden par and anchal. Lightweight, comfortable, and perfect for bridal or festive wear.',
        thumbnail: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Yellow Nakshi Kantha Embroidered Suit',
        slug: 'yellow-nakshi-kantha-embroidered-suit',
        sku: 'SHK-EMB-301',
        price: 4500,
        stock: 15,
        category: embroideryCategory,
        material: 'Pure Cotton',
        desc: 'A vibrant yellow three-piece suit featuring traditional Nakshi Kantha hand-embroidery all over the kameez. Includes a matching dupatta and salwar.',
        thumbnail: 'https://images.unsplash.com/photo-1551806235-a05d8f6f34ff?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Festive Maroon Khadi Panjabi',
        slug: 'festive-maroon-khadi-panjabi',
        sku: 'SHK-PAN-401',
        price: 3200,
        discountPrice: 2800,
        stock: 20,
        category: panjabiCategory,
        material: 'Premium Khadi Cotton',
        desc: 'Classic maroon Panjabi tailored from breathable hand-spun Khadi. Features subtle contrast embroidery around the collar and chest button placket.',
        thumbnail: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Macrame Wall Hanging Tapestry',
        slug: 'macrame-wall-hanging-tapestry',
        sku: 'SHK-HOM-501',
        price: 1800,
        stock: 10,
        category: homeDecorCategory,
        material: 'Natural Cotton Cord & Wooden Dowel',
        desc: 'Bring a bohemian aesthetic to your living space with this intricately knotted macrame wall hanging. Made from 100% natural, unbleached cotton.',
        thumbnail: 'https://images.unsplash.com/photo-1528458876861-544fd1761a46?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Hand-Painted Floral Clay Vase',
        slug: 'hand-painted-floral-clay-vase',
        sku: 'SHK-HOM-502',
        price: 950,
        stock: 30,
        category: homeDecorCategory,
        material: 'Baked Clay',
        desc: 'A beautiful earthen vase hand-painted with bright Bengali floral motifs. Ideal for dry flower arrangements or as a standalone centerpiece.',
        thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Oxidized Silver Tribal Necklace',
        slug: 'oxidized-silver-tribal-necklace',
        sku: 'SHK-JEW-203',
        price: 2200,
        discountPrice: 1950,
        stock: 18,
        category: jewelleryCategory,
        material: 'Oxidized Brass/Silver Alloy',
        desc: 'A stunning statement necklace featuring traditional tribal motifs and metallic beadwork. Pairs elegantly with both sarees and western wear.',
        thumbnail: 'https://images.unsplash.com/photo-1599643477877-530e5562020f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Emerald Green Half-Silk Saree',
        slug: 'emerald-green-half-silk-saree',
        sku: 'SHK-SAR-104',
        price: 5500,
        stock: 22,
        category: sareeCategory,
        material: 'Half-Silk',
        desc: 'A budget-friendly yet highly elegant emerald green saree with a rich golden border. Woven in Rajshahi, it offers the drape of silk with the comfort of cotton.',
        thumbnail: 'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Nakshi Kantha Cushion Covers (Set of 2)',
        slug: 'nakshi-kantha-cushion-covers',
        sku: 'SHK-HOM-503',
        price: 1200,
        stock: 40,
        category: homeDecorCategory,
        material: 'Cotton Canvas',
        desc: 'Add a touch of Bengali heritage to your sofa. These cushion covers feature dense, authentic Nakshi Kantha hand-stitching over a dark canvas background.',
        thumbnail: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Artisan Bamboo Table Lamp',
        slug: 'artisan-bamboo-table-lamp',
        sku: 'SHK-HOM-504',
        price: 2500,
        stock: 12,
        category: homeDecorCategory,
        material: 'Treated Bamboo',
        desc: 'Handcrafted by Sylheti artisans, this bamboo table lamp casts a warm, patterned glow. Treated for durability and polished to a smooth finish.',
        thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'White Jacquard Premium Panjabi',
        slug: 'white-jacquard-premium-panjabi',
        sku: 'SHK-PAN-402',
        price: 4500,
        discountPrice: 4000,
        stock: 15,
        category: panjabiCategory,
        material: 'Cotton Jacquard',
        desc: 'A pristine white Panjabi featuring a subtle, self-patterned jacquard weave. Designed for Eid, weddings, and formal cultural events.',
        thumbnail: 'https://images.unsplash.com/photo-1603570388466-befbb851bfd7?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Carved Wooden Jewelry Box',
        slug: 'carved-wooden-jewelry-box',
        sku: 'SHK-GIF-601',
        price: 1600,
        stock: 25,
        category: giftCategory,
        material: 'Mehogany Wood',
        desc: 'An exquisite wooden keepsake box with deeply carved floral motifs on the lid. Features velvet interior lining. A perfect gift for loved ones.',
        thumbnail: 'https://images.unsplash.com/photo-1605332766468-45a707a0dc03?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Rickshaw Painted Serving Tray',
        slug: 'rickshaw-painted-serving-tray',
        sku: 'SHK-HOM-505',
        price: 1400,
        stock: 15,
        category: homeDecorCategory,
        material: 'Tin/Metal',
        desc: 'Celebrate Dhaka’s iconic street art! This durable metal tray is hand-painted by authentic Rickshaw artists featuring vibrant peacocks and florals.',
        thumbnail: 'https://images.unsplash.com/photo-1632230188730-222a00c74fbb?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Silk Embroidered Clutch Purse',
        slug: 'silk-embroidered-clutch-purse',
        sku: 'SHK-GIF-602',
        price: 1800,
        stock: 20,
        category: giftCategory,
        material: 'Raw Silk & Zari',
        desc: 'A premium raw silk clutch purse heavily embroidered with golden Zari thread. Essential accessory for weddings and parties.',
        thumbnail: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Black Georgette Embroidered Kameez',
        slug: 'black-georgette-embroidered-kameez',
        sku: 'SHK-EMB-302',
        price: 5200,
        discountPrice: 4800,
        stock: 10,
        category: embroideryCategory,
        material: 'Heavy Georgette',
        desc: 'An elegant black three-piece suit. The kameez is adorned with heavy threadwork and stone embellishments, accompanied by a chiffon dupatta.',
        thumbnail: 'https://images.unsplash.com/photo-1610448160477-9df03da9fb04?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Clay Beaded Bracelet & Anklet Set',
        slug: 'clay-beaded-bracelet-anklet-set',
        sku: 'SHK-JEW-204',
        price: 850,
        stock: 50,
        category: jewelleryCategory,
        material: 'Terracotta & Cotton Thread',
        desc: 'A charming, lightweight jewelry set composed of tiny, hand-painted terracotta beads strung on a durable, adjustable cotton cord.',
        thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'White Muslin Dhakai Jamdani',
        slug: 'white-muslin-dhakai-jamdani',
        sku: 'SHK-SAR-105',
        price: 18000,
        discountPrice: 16500,
        stock: 5,
        category: sareeCategory,
        material: 'Fine Muslin Cotton',
        desc: 'An ultra-premium, sheer white Muslin Jamdani saree with delicate silver thread weaving. A masterpiece of Bangladeshi handloom heritage.',
        thumbnail: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Jute Storage Basket Set',
        slug: 'jute-storage-basket-set',
        sku: 'SHK-HOM-506',
        price: 2100,
        stock: 25,
        category: homeDecorCategory,
        material: '100% Natural Jute',
        desc: 'A set of three eco-friendly, tightly braided jute baskets. Perfect for storing towels, toys, or using as rustic indoor plant covers.',
        thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Handcrafted Brass Teapot Gift Set',
        slug: 'handcrafted-brass-teapot-gift-set',
        sku: 'SHK-GIF-603',
        price: 3500,
        stock: 8,
        category: giftCategory,
        material: 'Solid Brass',
        desc: 'A vintage-style, intricately engraved brass teapot accompanied by two matching cups, presented in a velvet-lined luxury gift box.',
        thumbnail: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?q=80&w=800&auto=format&fit=crop',
      }
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
