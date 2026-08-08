import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserRole } from '../../shared';

/**
 * Users Service
 * Encapsulates transactional domain operations for user profile querying, token rotation storage,
 * and multi-address management.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  /**
   * Create a new authenticated user record with bcrypt hashed password
   */
  async createUser(data: { email: string; passwordHash: string; name: string; phone?: string; roles?: UserRole[] }): Promise<User> {
    const newUser = this.userRepository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      phone: data.phone,
      roles: data.roles || [UserRole.CUSTOMER],
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Failed to persist user record to repository');
    }
  }

  /**
   * Retrieve single user by email address (used during login and token evaluation)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Retrieve single user by primary UUID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with identifier ${id} not found in catalog`);
    }

    return user;
  }

  /**
   * Store cryptographic hash of refresh token for high-security token rotation
   */
  async setCurrentRefreshToken(refreshToken: string, userId: string): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: currentHashedRefreshToken });
  }

  /**
   * Erase refresh token upon session termination / logout
   */
  async removeRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null as any });
  }

  /**
   * Verify candidate refresh token against stored bcrypt hash during session renewal
   */
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);
    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  /**
   * Update personal demographic metrics or profile photo URL
   */
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    delete updateData.passwordHash; // Protect cryptographic fields from accidental overwrites
    delete updateData.refreshToken;
    delete updateData.roles;

    await this.userRepository.update(userId, updateData);
    return this.findById(userId);
  }

  // --- Address Management ---

  async addAddress(userId: string, addressData: Partial<Address>): Promise<Address> {
    const user = await this.findById(userId);

    // If setting as default, unset others first
    if (addressData.isDefaultShipping) {
      await this.addressRepository.update({ userId, isDefaultShipping: true }, { isDefaultShipping: false });
    }
    if (addressData.isDefaultBilling) {
      await this.addressRepository.update({ userId, isDefaultBilling: true }, { isDefaultBilling: false });
    }

    const newAddress = this.addressRepository.create({
      ...addressData,
      userId,
    });

    return this.addressRepository.save(newAddress);
  }

  async updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (addressData.isDefaultShipping) {
      await this.addressRepository.update({ userId, isDefaultShipping: true }, { isDefaultShipping: false });
    }
    if (addressData.isDefaultBilling) {
      await this.addressRepository.update({ userId, isDefaultBilling: true }, { isDefaultBilling: false });
    }

    Object.assign(address, addressData);
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const result = await this.addressRepository.delete({ id: addressId, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    }
  }

  async setDefaultAddress(userId: string, addressId: string, type: 'shipping' | 'billing'): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (type === 'shipping') {
      await this.addressRepository.update({ userId, isDefaultShipping: true }, { isDefaultShipping: false });
      address.isDefaultShipping = true;
    } else {
      await this.addressRepository.update({ userId, isDefaultBilling: true }, { isDefaultBilling: false });
      address.isDefaultBilling = true;
    }

    await this.addressRepository.save(address);
  }
}
