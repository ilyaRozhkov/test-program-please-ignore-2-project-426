import { components } from './types.generated';

export type User = components['schemas']['User'];
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type LoginResponse = components['schemas']['LoginResponse'];
export type ApiError = components['schemas']['ApiError'];
export type ErrorResponse = components['schemas']['ErrorResponse'];

export type Category = components['schemas']['Category'];
export type Product = components['schemas']['Product'];
export type ProductListParams = components['schemas']['ProductListParams'];
export type ProductListResponse = components['schemas']['ProductListResponse'];

export type CreateOrderRequest = components['schemas']['CreateOrderRequest'];
export type CreateOrderResponse = components['schemas']['CreateOrderResponse'];
export type Order = components['schemas']['Order'];
export type OrderItem = components['schemas']['OrderItem'];