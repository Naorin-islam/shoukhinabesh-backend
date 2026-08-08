import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items', 'items.product'],
      });
    }

    return cart;
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity, selectedColor, selectedSize } = addToCartDto;

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    const cart = await this.getCart(userId);

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Cannot add more. Only ${product.stock} items left in stock`);
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        selectedColor,
        selectedSize,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.product.stock < updateDto.quantity) {
      throw new BadRequestException(`Only ${item.product.stock} items left in stock`);
    }

    item.quantity = updateDto.quantity;
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const result = await this.cartItemRepository.delete({ id: itemId, cartId: cart.id });

    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }
}
