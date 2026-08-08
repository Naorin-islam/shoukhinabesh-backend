/**
 * OrderStatus Enum
 * Defines the strict deterministic lifecycle of an order from creation to fulfillment or cancellation.
 */
export enum OrderStatus {
  PENDING = 'PENDING',       // Order received, awaiting payment or verification
  CONFIRMED = 'CONFIRMED',   // Payment or COD verified, inventory reserved
  PROCESSING = 'PROCESSING', // Artisan preparing and crafting/packaging item
  SHIPPED = 'SHIPPED',       // Handed over to delivery carrier with tracking
  DELIVERED = 'DELIVERED',   // Successfully delivered to customer destination
  CANCELLED = 'CANCELLED',   // Cancelled prior to shipment or due to failed payment
  REFUNDED = 'REFUNDED',     // Payment refunded to user following return or issue
}

/**
 * PaymentStatus Enum
 * Monitors financial transaction state for SSLCommerz and Cash on Delivery.
 */
export enum PaymentStatus {
  PENDING = 'PENDING',   // Transaction initiated but incomplete
  PAID = 'PAID',         // Transaction completed and verified via SSLCommerz/COD
  FAILED = 'FAILED',     // Gateway rejected transaction or network failure
  REFUNDED = 'REFUNDED', // Funds returned to customer account
}

/**
 * PaymentMethod Enum
 * Supported transaction gateway channels.
 */
export enum PaymentMethod {
  COD = 'COD',               // Cash on Delivery
  SSLCOMMERZ = 'SSLCOMMERZ', // SSLCommerz Electronic Payment Gateway
}
