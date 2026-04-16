import { Injectable } from "@nestjs/common";
import { AuthorizeResponse, GetPaymentStatusResponse } from "./payments.types";

type PaymentRecord = {
  paymentId: string;
  status: string;
  idempotencyKey?: string;
};

@Injectable()
export class PaymentsService {
  private payments = new Map<string, PaymentRecord>();
  private idempotencyMap = new Map<string, string>(); // key -> paymentId

  authorize(
    orderId: string,
    amount: number,
    currency: string,
    idempotencyKey?: string,
  ): AuthorizeResponse {
    if (idempotencyKey && this.idempotencyMap.has(idempotencyKey)) {
      const existingPaymentId = this.idempotencyMap.get(idempotencyKey)!;
      return this.payments.get(existingPaymentId)!;
    }

    const paymentId = "pay_" + Date.now();

    const record: PaymentRecord = {
      paymentId,
      status: "AUTHORIZED",
      idempotencyKey,
    };

    this.payments.set(paymentId, record);

    if (idempotencyKey) {
      this.idempotencyMap.set(idempotencyKey, paymentId);
    }

    return record;
  }

  getStatus(paymentId: string): GetPaymentStatusResponse {
    const status = this.payments.get(paymentId)?.status || "NOT_FOUND";

    return {
      paymentId,
      status,
    };
  }
}
