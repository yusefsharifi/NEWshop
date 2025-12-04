/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Order creation request
 */
export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  payment_method: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
}

/**
 * Order creation response
 */
export interface CreateOrderResponse {
  success: boolean;
  order_id: number;
  order_number: string;
  invoice_id?: number;
}