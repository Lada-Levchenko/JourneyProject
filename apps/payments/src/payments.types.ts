export interface AuthorizeRequest {
  orderId: string;
  amount: number;
  currency: string;
  idempotencyKey?: string;
}

export interface AuthorizeResponse {
  paymentId: string;
  status: string;
}

export interface GetPaymentStatusRequest {
  paymentId: string;
}

export interface GetPaymentStatusResponse {
  paymentId: string;
  status: string;
}
