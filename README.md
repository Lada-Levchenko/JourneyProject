# JourneyProject

Backend-проєкт на **NestJS** з Docker-запуском, базою даних, чергою, файловим сховищем, окремим worker-сервісом, gRPC payments-сервісом, логуванням і CI/CD.

## Що використовується

- **NestJS**
- **GraphQL**
- **PostgreSQL**
- **RabbitMQ**
- **MinIO**
- **Docker / Docker Compose**
- **Grafana + Loki + Promtail**
- **GitHub Actions**
- **Hetzner VPS**

---

## Інфраструктура

Проєкт складається з таких сервісів:

- `api` — основний HTTP API
- `worker` — фонова обробка замовлень
- `payments` — окремий gRPC-сервіс для імітації авторизації оплати
- `postgres` — база даних
- `rabbitmq` — черга повідомлень
- `minio` — файлове сховище
- `grafana/loki/promtail` — логи та моніторинг

### Задеплоєні середовища

- **Stage:** http://178.104.207.183:3015
- **Production:** http://178.104.207.183:4015

### Health check

- Stage: `http://178.104.207.183:3015/api/health`
- Production: `http://178.104.207.183:4015/api/health`

---

## Локальний запуск

### 1. Налаштувати змінні середовища

Заповнити:

* кореневий `.env`
* `apps/api/.env.production`

### 2. Запустити сервіси

```bash
docker compose -f compose.yml up -d --build
```

### 3. Запустити міграції та seed

Через profile:

```bash
docker compose --profile tools up --build
```

або:

```bash
docker compose run --rm migrate
docker compose run --rm seed
```

### 4. Перевірити, що API запустився

```bash
curl http://localhost:3015/api/health
```

---

## Лінтинг і тести

```
npm --workspace api run lint
npm --workspace payments run lint

npm --workspace api run test
---

Тести поки мінімальні, включають перевірку першого кроку основного сценарію.

## Основний контур: створення та обробка замовлення

Основний бізнес-сценарій у проєкті — це створення замовлення, підтвердження оплати та фонова обробка до фінального статусу.

### Очікуваний життєвий цикл замовлення

1. користувач отримує список товарів
2. логіниться
3. отримує свій `userId`
4. створює замовлення (замовлення створюється зі статусом `PAYMENT_PENDING`)
5. викликається endpoint оплати, API викликає `payments` через gRPC і переводить замовлення в `PAID`
6. далі `worker` через RabbitMQ підхоплює обробку (статус змінюється спочатку на `PROCESSING`, потім на `COMPLETED`)
7. фінальний статус можна перевірити окремим запитом

---

## Як перевірити основний контур

### 1. Отримати product id

```http
GET http://178.104.207.183:3015/api/products?type=physical&search=poster&limit=2
```

---

### 2. Залогінитись

```http
POST http://178.104.207.183:3015/api/auth/login
Content-Type: application/json

{
  "email": "admin@wejourney.app",
  "password": "admin123"
}
```

або:

```http
POST http://178.104.207.183:3015/api/auth/login
Content-Type: application/json

{
  "email": "dan@example.com",
  "password": "admin123"
}
```

У відповіді потрібно взяти `access token`.

---

### 3. Подивитись свого користувача

```http
GET http://178.104.207.183:3015/api/auth/me
Authorization: Bearer <token>
```

Цей запит потрібен, щоб отримати свій `userId`.

---

### 4. Подивитись свої поточні замовлення

```http
GET http://178.104.207.183:3015/api/orders
Authorization: Bearer <token>
```

---

### 5. Створити замовлення

```http
POST http://178.104.207.183:3015/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "<userId>",
  "items": [
    {
      "productId": "<productId>",
      "quantity": 2
    }
  ],
  "idempotencyKey": "<unique-key>"
}
```

Після створення замовлення його початковий статус: `PAYMENT_PENDING`


---

### 6. Для адміністратора: переглянути всі замовлення

```http
GET http://178.104.207.183:3015/api/orders/all
Authorization: Bearer <token>
```

Цей endpoint доступний лише адміну.

---

### 7. Імітувати підтвердження оплати

```http
POST http://178.104.207.183:3015/api/orders/<orderId>/pay
Authorization: Bearer <token>
```

Що відбувається далі:

* API викликає `payments` через gRPC
* статус замовлення змінюється на `PAID`
* `worker` через RabbitMQ бере замовлення в обробку
* статус переходить у `PROCESSING`
* після завершення обробки статус стає `COMPLETED`

---

### 8. Перевірити фінальний статус через GraphQL

```http
POST http://178.104.207.183:3015/graphql
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "query": "query ExampleQuery($pagination: OrdersPaginationInput, $filter: OrdersFilterInput) { orders(pagination: $pagination, filter: $filter) { nodes { createdAt id idempotencyKey items { id priceAtPurchase product { category createdAt id isActive price purchasePolicy stock title type updatedAt } quantity } status updatedAt } pageInfo { endCursor hasNextPage } totalCount } }",
  "variables": {
    "pagination": {
      "cursor": null,
      "limit": 1
    },
    "filter": {
      "status": "COMPLETED"
    }
  }
}
```

Це один зі способів перевірити, що замовлення дійшло до фінального статусу `COMPLETED`.

---

## Короткий сценарій перевірки

Мінімальна послідовність для демонстрації:

1. `GET /api/products?...` — отримати `productId`
2. `POST /api/auth/login` — отримати token
3. `GET /api/auth/me` — отримати `userId`
4. `POST /api/orders` — створити замовлення
5. `POST /api/orders/{orderId}/pay` — запустити оплату та обробку
6. `POST /graphql` — перевірити, що статус став `COMPLETED`

---

## Логи та моніторинг

Для логів і спостереження використовується:

* **Grafana**
* **Loki**
* **Promtail**

Логи збираються з Docker-контейнерів і можуть фільтруватися за:

* `service`
* `environment`
* `project`

На основі логів будуються дашборди з метриками для stage і prod середовищ.

Їх можна переглянути за ендпоїнтом (меню > Dashboards):
http://178.104.207.183:3000/

Логін: stagemon
Пароль: stagemonPass

<img width="1907" height="966" alt="image" src="https://github.com/user-attachments/assets/8321d448-4a15-4f79-9a3e-19e4a677e394" />
<img width="1908" height="422" alt="image" src="https://github.com/user-attachments/assets/1329b270-059a-4f99-b1e0-0a4d31f62bde" />


---

## CI/CD

У репозиторії є такі workflow:

* `.github/workflows/pr-checks.yml`
* `.github/workflows/build-and-stage.yml`
* `.github/workflows/deploy-prod.yml`

### Що робить pipeline

* перевіряє Pull Request (запускає lint і тести)
* збирає Docker images
* пушить images у GHCR
* автоматично деплоїть **stage**
* окремо вручну деплоїть **production**


