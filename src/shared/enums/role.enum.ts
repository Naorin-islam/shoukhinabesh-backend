/**
 * UserRole Enum
 * Defines Role-Based Access Control (RBAC) authorization tiers across the platform.
 */
export enum UserRole {
  ADMIN = 'ADMIN',       // Full system privileges, moderation, analytics, and settings
  SELLER = 'SELLER',     // Storefront, product inventory, order fulfillment, and seller analytics
  CUSTOMER = 'CUSTOMER', // Regular shopping user with cart, wishlist, and order tracking
}
