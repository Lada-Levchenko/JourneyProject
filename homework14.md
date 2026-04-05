# Домашнє завдання: Orders + Payments (gRPC)


## Архітектура

```
HTTP Client
    ↓
Orders Service
    ↓ gRPC
Payments Service
    ↓
Order status = PAID
    ↓
RabbitMQ event (order.paid)
    ↓
Order processing worker
    ↓
PROCESSING → COMPLETED
```

---

## Як запустити локально (але краще через докер)

### 1. Запустити payments-service

```
cd apps/payments
npm i
npm run dev
```

Сервіс запускається на:

```
localhost:50051 (gRPC)
```

---

### 2. Запустити api

```
cd apps/api
npm i
npm run dev
```

Сервіс запускається на:

```
localhost:3015 (HTTP)
```

Потрібно запоінити apps/api/.env.local для api по прикладу в apps/api/.env.example. В нього поміж іншим входять такі змінні:

```
PAYMENTS_GRPC_URL=localhost:50051
PAYMENTS_GRPC_TIMEOUT_MS=3000
RABBITMQ_URL=amqp://localhost:5672
```

## Як запустити через докер (щоб підняло всі необхідні контейнери)

Прошу зауважити, оскільки це монорепо, для запуску потрібно два env-файли:
  - `.env` (є відповідний шаблон `.env.example`)
  - `apps/api/.env.production` (є відповідний шаблон `apps/api/.env.production.example`)

Змінні в них не дублюються. `.env` використовується для compose, і деякі змінні з нього прокидуються далі в контейнери.

Запуск основних контейнерів:

```bash
docker compose -f compose.yml up -d --build
```

### Міграції та seed

Через profile:

```bash
docker compose --profile tools up --build
```

або:

```bash
docker compose run --rm migrate
docker compose run --rm seed
```

---

## Happy Path (End-to-End сценарій)

### Крок 1 — створити замовлення

```
POST http://localhost:3015/api/orders
```

Body:

```json
{
  "userId": "user-1",
  "items": [
    {
      "productId": "product-1",
      "quantity": 1
    }
  ]
}
```

У відповідь повертається:

```
orderId
status = PAYMENT_PENDING
```

---

### Крок 2 — оплатити замовлення

```
POST http://localhost:3015/api/orders/{orderId}/pay
```

Flow:

```
Orders → gRPC → Payments.Authorize
Payments → повертає paymentId + AUTHORIZED
Orders → змінює статус на PAID
Orders → публікує подію order.paid у RabbitMQ
Worker → PROCESSING → COMPLETED
```

---

## Де лежить payments.proto

```
packages/contracts/proto/payments.proto
```

Оскільки packages вже шериться між сервісами.

### У payments-service

Використовується для підняття gRPC server:

```
Transport.GRPC
protoPath: packages/contracts/payments.proto
package: payments
```

### У orders-service

Використовується для gRPC client:

```
ClientsModule.register({
  transport: Transport.GRPC,
  options: {
    url: PAYMENTS_GRPC_URL,
    package: 'payments',
    protoPath: packages/contracts/payments.proto
  }
})
```

Orders service взаємодіє з Payments тільки через .proto контракт.
Прямого імпорту коду payments-service немає.
