# Домашнє завдання: Orders API + RabbitMQ Worker

## Опис

У цьому проєкті реалізовано:

- API для створення замовлення;
- асинхронну обробку замовлення через RabbitMQ;
- worker-процес для обробки повідомлень;
- retry-механізм;
- DLQ (dead-letter queue);
- idempotency на рівні обробки повідомлень.

---

## Як запустити

Прошу зауважити, оскільки це монорепо, для запуску потрібно два env-файли:

- `.env` (є відповідний шаблон `.env.example`)
- `apps/api/.env.production` (є відповідний шаблон `apps/api/.env.production.example`)

Змінні в них не дублюються. `.env` використовується для compose, і деякі змінні з нього прокидуються далі в контейнери.

```bash
docker compose -f compose.yml up -d --build
```

## Топологія RabbitMQ

У системі використовується така топологія:

### Exchange

- `orders.exchange`
- тип: `direct`

### Queues

- `orders.process` — основна черга для обробки замовлень
- `orders.dlq` — черга для повідомлень, які не вдалося обробити успішно

### Routing keys

- `orders.process`
- `orders.dlq`

---

## Що куди летить

### Публікація нового замовлення

Після створення замовлення API публікує повідомлення в:

- **exchange**: `orders.exchange`
- **routing key**: `orders.process`

Повідомлення потрапляє в чергу:

- `orders.process`

---

### Retry

Якщо під час обробки сталася retryable-помилка, worker:

- збільшує `attempt`
- повторно публікує повідомлення в:
  - **exchange**: `orders.exchange`
  - **routing key**: `orders.process`

Тобто повідомлення знову повертається в `orders.process`.

---

### DLQ

Якщо:

- помилка є `NonRetryableError`, або
- кількість спроб перевищила `MAX_ATTEMPTS`,

повідомлення публікується в:

- **exchange**: `orders.exchange`
- **routing key**: `orders.dlq`

і потрапляє в:

- `orders.dlq`

---

## Як перевірити через RabbitMQ Management UI

RabbitMQ Management UI доступний за адресою:

```text
http://localhost:15672
```

Логін і пароль:

- username: значення `RABBITMQ_DEFAULT_USER`
- password: значення `RABBITMQ_DEFAULT_PASS`

---

## Який retry-механізм обрано

У проєкті використано **application-level retry**.

Якщо worker отримує retryable-помилку:

1. читає поточне значення `attempt`;
2. якщо `attempt < MAX_ATTEMPTS`, формує нове повідомлення;
3. збільшує `attempt` на 1;
4. через `setTimeout(...)` повторно публікує повідомлення в `orders.process`.

---

## Як відтворити сценарії

## 1. Happy path

### Приклад запиту

```bash
curl -X POST http://localhost:3015/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "11111111-1111-1111-1111-111111111111",
    "items": [
      {
        "productId": "22222222-2222-2222-2222-222222222222",
        "quantity": 2
      },
      {
        "productId": "33333333-3333-3333-3333-333333333333",
        "quantity": 1
      }
    ],
    "idempotencyKey": "44444444-4444-4444-4444-444444444444"
  }'
```

## 4. Idempotency

1. Надіслати повідомлення з певним `messageId`.
2. Дочекатися успішної обробки.
3. Повторно надіслати **те саме повідомлення** з тим самим `messageId`.
4. Перевірити, що повторної бізнес-обробки не сталося.

---

## Як реалізована idempotency

Idempotency реалізована через таблицю `ProcessedMessages`.

### Принцип роботи

Перед основною обробкою повідомлення worker намагається вставити запис у `ProcessedMessages`:

- `handler`
- `messageId`
- `idempotencyKey`

Якщо вставка проходить успішно, повідомлення вважається новим і обробка продовжується.

Якщо БД повертає помилку унікальності (`23505`), це означає, що таке повідомлення вже було оброблене раніше.
У такому випадку worker кидає `DuplicateMessageError`, після чого повідомлення не обробляється повторно.
