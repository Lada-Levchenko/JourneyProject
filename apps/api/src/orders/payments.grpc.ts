import { Observable } from "rxjs";

export interface PaymentsGrpcService {
  Authorize(data: {
    orderId: string;
    amount: number;
    currency: string;
  }): Observable<{
    paymentId: string;
    status: string;
  }>;

  GetPaymentStatus(data: { paymentId: string }): Observable<{
    paymentId: string;
    status: string;
  }>;
}
