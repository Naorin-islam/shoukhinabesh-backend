import { UserRole } from '../enums/role.enum';

/**
 * User Interface
 * Represents user data across database projections, API payloads, and frontend state.
 */
export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePhoto?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  addresses?: IAddress[];
  address?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Address Interface
 * Represents shipping and billing address records tied to a user account.
 */
export interface IAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street?: string;
  streetAddress: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

/**
 * Authentication Response Tokens
 */
export interface IAuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Authentication Success Payload
 */
export interface IAuthResponse {
  user: IUser;
  tokens: IAuthTokens;
}
