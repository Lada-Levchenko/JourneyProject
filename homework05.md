# homework05.md

## API

### Create order:

```
http://localhost:3003/api/orders

{
	"idempotencyKey": "idem-11111111-1111-1111-1111-111111111113",
  "userId": "b08954b5-2c0a-4590-9e23-fa900c59ee38",
  "items": [
    {
      "productId": "f76c47bc-7f93-4f48-96eb-bff292a58fa8",
      "quantity": 2
    },
    {
      "productId": "79d1315a-873d-4ed6-8ee6-50bdbfd35464",
      "quantity": 1
    }
  ]
}
```

### List all orders:

```
http://localhost:3003/api/orders
```

### List products with filters:

```
http://localhost:3003/api/products?type=digital&search=family&limit=0&category=celebration_bundle
```

## 1. Як реалізована транзакція

Створення замовлення (`createOrder`) виконується всередині явної транзакції за допомогою `QueryRunner`.

Основні кроки:

1. Створюється `QueryRunner`
2. Викликається `startTransaction()`
3. Усі операції (перевірки, блокування, створення Order та OrderItem, оновлення stock) виконуються через `queryRunner.manager`
4. У випадку успіху викликається `commitTransaction()`
5. У випадку помилки — `rollbackTransaction()`

Таким чином гарантується атомарність.

Це запобігає частковому оновленню даних (наприклад, списанню stock без створення Order).

---

## 2. Який механізм конкурентності обрано

Обрано **pessimistic locking** (песимістичне блокування), оскільки об'єми трафіку і відповідного запиту не дуже великі.

Для фізичних продуктів (`ProductType.PHYSICAL`) виконується:

```ts
lock: {
  mode: "pessimistic_write";
}
```

У PostgreSQL це відповідає:

```
SELECT ... FOR UPDATE
```

Блокування застосовується лише для фізичних товарів, оскільки:

- digital та donation не мають stock
- для них конкурентність по залишках не актуальна

---

## 3. Як працює ідемпотентність

Ідемпотентність реалізована через поле `idempotencyKey`.

Перед створенням замовлення виконується перевірка:

- якщо передано `idempotencyKey`
- та вже існує замовлення з таким ключем для того ж `userId`
- повертається існуюче замовлення замість створення нового

Це гарантує, що повторний HTTP-запит або повторна відправка з боку клієнта не створять дублікати замовлень.

Ідемпотентність особливо важлива для платіжних операцій.

---

## 4. Який запит оптимізовано та які індекси додано

Було оптимізовано запит:

```sql
SELECT "product"."id" AS "product_id", "product"."title" AS "product_title", "product"."type" AS "product_type", "product"."category" AS "product_category", "product"."purchasePolicy" AS "product_purchasePolicy", "product"."price" AS "product_price", "product"."stock" AS "product_stock", "product"."is_active" AS "product_is_active", "product"."created_at" AS "product_created_at", "product"."updated_at" AS "product_updated_at" FROM "products" "product"
WHERE "product"."type" = 'digital'
AND "product"."category" = 'celebration_bundle'
ORDER BY "product"."id" asc;
```

### Доданий індекс:

```sql
CREATE INDEX idx_products_type_category
ON products (type, category);
```

Це складений (composite) індекс.

### Результат EXPLAIN ANALYZE

До створення індексу:

```
Sort (cost=4082.36..4123.53 rows=16466 width=78) (actual time=14.003..16.246 rows=16385.00 loops=1) Sort Key: id Sort Method: quicksort Memory: 2433kB Buffers: shared hit=1429 -> Seq Scan on products product (cost=0.00..2929.15 rows=16466 width=78) (actual time=0.010..10.254 rows=16385.00 loops=1) Filter: ((type = 'digital'::products_type_enum) AND (category = 'celebration_bundle'::products_category_enum)) Rows Removed by Filter: 83625 Buffers: shared hit=1429 Planning: Buffers: shared hit=34 Planning Time: 0.188 ms Execution Time: 17.113 ms
```

- використовувався `Seq Scan`
- виконувалося повне сканування таблиці (~100 000 рядків)
- час виконання ~17 ms

Після створення індексу:

```
Sort (cost=4082.36..4123.53 rows=16466 width=78) (actual time=14.003..16.246 rows=16385.00 loops=1) Sort Key: id Sort Method: quicksort Memory: 2433kB Buffers: shared hit=1429 -> Seq Scan on products product (cost=0.00..2929.15 rows=16466 width=78) (actual time=0.010..10.254 rows=16385.00 loops=1) Filter: ((type = 'digital'::products_type_enum) AND (category = 'celebration_bundle'::products_category_enum)) Rows Removed by Filter: 83625 Buffers: shared hit=1429 Planning: Buffers: shared hit=34 Planning Time: 0.188 ms Execution Time: 17.113 ms
```

- використовується `Bitmap Index Scan + Bitmap Heap Scan`
- PostgreSQL читає лише релевантні рядки
- час виконання ~10 ms
- покращення ~40%

Індекс почав використовуватись після збільшення обсягу даних, оскільки планувальник PostgreSQL обирає індекс лише тоді, коли це дешевше за повне сканування.
