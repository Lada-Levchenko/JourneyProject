import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { PaymentsService } from "./payments.service";
import * as paymentsTypes from "./payments.types";

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @GrpcMethod("Payments", "Authorize")
  authorize(data: paymentsTypes.AuthorizeRequest) {
    return this.paymentsService.authorize(
      data.orderId,
      data.amount,
      data.currency,
    );
  }

  @GrpcMethod("Payments", "GetPaymentStatus")
  getPaymentStatus(data: paymentsTypes.GetPaymentStatusRequest) {
    return this.paymentsService.getStatus(data.paymentId);
  }
}
