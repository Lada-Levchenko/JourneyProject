export interface OrderMessage {
  orderId: string;
  messageId: string;
  idempotencyKey: string | null;
}
