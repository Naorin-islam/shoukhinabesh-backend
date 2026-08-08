import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from '../entities/cart.entity';
import { Coupon } from '../entities/coupon.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * CartService Unit & Financial Pricing Engine Tests
 * Verifies coupon minimum threshold protections, statutory VAT calculation precision, and free shipping waivers.
 */
describe('CartService (Pricing Engine & Promotions)', () => {
  let service: CartService;
  let couponRepo: any;
  let cartRepo: any;
  let productRepo: any;

  const mockCoupon = {
    code: 'HERITAGE10',
    discountPercentage: 10,
    minPurchaseAmount: 2000,
    maxDiscountAmount: 1000,
    expirationDate: new Date(Date.now() + 86400000), // Tomorrow
    isActive: true,
    usageLimit: 100,
    usedCount: 5,
  };

  beforeEach(async () => {
    cartRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), delete: jest.fn() };
    couponRepo = { findOne: jest.fn() };
    productRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(CartItem), useValue: cartRepo },
        { provide: getRepositoryToken(Coupon), useValue: couponRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCoupon', () => {
    it('should successfully validate an active promotional code when subtotal meets minimum threshold', async () => {
      couponRepo.findOne.mockResolvedValue(mockCoupon);
      const result = await service.validateCoupon('HERITAGE10', 3000);
      expect(result.code).toEqual('HERITAGE10');
    });

    it('should throw BadRequestException if subtotal falls below required campaign minimum', async () => {
      couponRepo.findOne.mockResolvedValue(mockCoupon);
      await expect(service.validateCoupon('HERITAGE10', 1500)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if submitted promo code does not exist', async () => {
      couponRepo.findOne.mockResolvedValue(null);
      await expect(service.validateCoupon('UNKNOWN', 5000)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if promotional code has expired', async () => {
      couponRepo.findOne.mockResolvedValue({
        ...mockCoupon,
        expirationDate: new Date(Date.now() - 86400000), // Yesterday
      });
      await expect(service.validateCoupon('HERITAGE10', 5000)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserCart (Tax & Delivery Computations)', () => {
    it('should award free shipping automatically when subtotal reaches or exceeds ৳5,000 threshold', async () => {
      cartRepo.find.mockResolvedValue([
        { unitPrice: 6000, quantity: 1, product: { name: 'Jamdani Saree' } },
      ]);
      const cart = await service.getUserCart('user-uuid');
      expect(cart.subtotal).toEqual(6000);
      expect(cart.shippingCharge).toEqual(0); // Free shipping!
      expect(cart.tax).toEqual(Math.round(6000 * 0.05)); // 5% VAT
      expect(cart.total).toEqual(6000 + Math.round(6000 * 0.05));
    });

    it('should append standard ৳120 express shipping charge when subtotal is under ৳5,000', async () => {
      cartRepo.find.mockResolvedValue([
        { unitPrice: 1500, quantity: 1, product: { name: 'Terracotta Jewellery' } },
      ]);
      const cart = await service.getUserCart('user-uuid');
      expect(cart.subtotal).toEqual(1500);
      expect(cart.shippingCharge).toEqual(120);
      expect(cart.total).toEqual(1500 + 120 + Math.round(1500 * 0.05));
    });
  });
});
