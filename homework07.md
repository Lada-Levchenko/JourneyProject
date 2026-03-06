# homework07.md

## code-first vs schema-first

У проєкті використовується підхід code-first, оскільки він уже побудований на основі TypeORM-сутностей і активно розвивається. code-first мінімізує дублювання коду та дозволяє автоматично підтримувати схему в актуальному стані відповідно до доменної моделі яка поки знаходиться в стані частих змін.

Коли більшість роботи по структуризації данних буде зроблена і будуть зрозумілі потреби основних екранів додатку, розгляну перехід на schema-first підхід.

## Як реалізований orders query

Запит `orders` реалізовано у GraphQL resolver, який виконує лише роль thin-layer та делегує бізнес-логіку у service layer.

Resolver лише приймає `filter` та `pagination` аргументи, викликає метод `OrdersService.findAll` і повертає результат без додаткової бізнес-логіки

Уся логіка:

- фільтрації
- пагінації
- побудови cursor
- роботи з базою даних

реалізована у `OrdersService`.

Для реалізації пагінації було обрано підхід connection (OrdersConnection), оскільки він дозволяє передавати додаткову метаінформацію, наприклад totalCount, що є важливим елементом для пагінації

Cursor будується на основі комбінованого ключа `createdAt + id`, що гарантує стабільне сортування навіть коли кілька записів мають однаковий `createdAt`.


## Виявлення проблеми N+1

Для перевірки наявності проблеми N+1 було увімкнено логування SQL-запитів у TypeORM.

Було виконано запит:

```graphql
query {
  orders {
    nodes {
      items {
        product {
          id
          title
          price
        }
      }
    }
  }
}
```

Проблема N+1 виявлена: для кожного запису замовлення виконувався окремий запит до бази даних для отримання даних про товар:

```sql
query: SELECT DISTINCT "distinctAlias"."order_id" AS "ids_order_id", "distinctAlias"."order_created_at" FROM (SELECT "order"."id" AS "order_id", "order"."user_id" AS "order_user_id", "order"."status" AS "order_status", "order"."idempotency_key" AS "order_idempotency_key", "order"."created_at" AS "order_created_at", "order"."updated_at" AS "order_updated_at", "item"."id" AS "item_id", "item"."order_id" AS "item_order_id", "item"."product_id" AS "item_product_id", "item"."quantity" AS "item_quantity", "item"."price_at_purchase" AS "item_price_at_purchase" FROM "orders" "order" LEFT JOIN "order_items" "item" ON "item"."order_id"="order"."id") "distinctAlias" ORDER BY "distinctAlias"."order_created_at" DESC, "order_id" ASC LIMIT 20
query: SELECT "order"."id" AS "order_id", "order"."user_id" AS "order_user_id", "order"."status" AS "order_status", "order"."idempotency_key" AS "order_idempotency_key", "order"."created_at" AS "order_created_at", "order"."updated_at" AS "order_updated_at", "item"."id" AS "item_id", "item"."order_id" AS "item_order_id", "item"."product_id" AS "item_product_id", "item"."quantity" AS "item_quantity", "item"."price_at_purchase" AS "item_price_at_purchase" FROM "orders" "order" LEFT JOIN "order_items" "item" ON "item"."order_id"="order"."id" WHERE "order"."id" IN ($1, $2, $3) ORDER BY "order"."created_at" DESC -- PARAMETERS: ["eb8e4529-4509-4c53-b0b9-ba4a0de55cf2","11111111-1111-1111-1111-111111111111","22222222-2222-2222-2222-222222222222"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["f76c47bc-7f93-4f48-96eb-bff292a58fa8"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["79d1315a-873d-4ed6-8ee6-50bdbfd35464"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["f1d580b5-1228-4b81-9531-098711a99cee"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["58cc52be-cec3-4c2c-b650-a8b43674aa22"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["f76c47bc-7f93-4f48-96eb-bff292a58fa8"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" = $1)) LIMIT 1 -- PARAMETERS: ["79d1315a-873d-4ed6-8ee6-50bdbfd35464"]
```

Після імплементації DataLoader всі продукти отримуються одним батчем:

```sql
query: SELECT DISTINCT "distinctAlias"."order_id" AS "ids_order_id", "distinctAlias"."order_created_at" FROM (SELECT "order"."id" AS "order_id", "order"."user_id" AS "order_user_id", "order"."status" AS "order_status", "order"."idempotency_key" AS "order_idempotency_key", "order"."created_at" AS "order_created_at", "order"."updated_at" AS "order_updated_at", "item"."id" AS "item_id", "item"."order_id" AS "item_order_id", "item"."product_id" AS "item_product_id", "item"."quantity" AS "item_quantity", "item"."price_at_purchase" AS "item_price_at_purchase" FROM "orders" "order" LEFT JOIN "order_items" "item" ON "item"."order_id"="order"."id") "distinctAlias" ORDER BY "distinctAlias"."order_created_at" DESC, "order_id" ASC LIMIT 20
query: SELECT "order"."id" AS "order_id", "order"."user_id" AS "order_user_id", "order"."status" AS "order_status", "order"."idempotency_key" AS "order_idempotency_key", "order"."created_at" AS "order_created_at", "order"."updated_at" AS "order_updated_at", "item"."id" AS "item_id", "item"."order_id" AS "item_order_id", "item"."product_id" AS "item_product_id", "item"."quantity" AS "item_quantity", "item"."price_at_purchase" AS "item_price_at_purchase" FROM "orders" "order" LEFT JOIN "order_items" "item" ON "item"."order_id"="order"."id" WHERE "order"."id" IN ($1, $2, $3) ORDER BY "order"."created_at" DESC -- PARAMETERS: ["eb8e4529-4509-4c53-b0b9-ba4a0de55cf2","11111111-1111-1111-1111-111111111111","22222222-2222-2222-2222-222222222222"]
query: SELECT "Product"."id" AS "Product_id", "Product"."title" AS "Product_title", "Product"."type" AS "Product_type", "Product"."category" AS "Product_category", "Product"."purchasePolicy" AS "Product_purchasePolicy", "Product"."price" AS "Product_price", "Product"."stock" AS "Product_stock", "Product"."is_active" AS "Product_is_active", "Product"."created_at" AS "Product_created_at", "Product"."updated_at" AS "Product_updated_at" FROM "products" "Product" WHERE (("Product"."id" IN ($1, $2, $3, $4))) -- PARAMETERS: ["f76c47bc-7f93-4f48-96eb-bff292a58fa8","79d1315a-873d-4ed6-8ee6-50bdbfd35464","f1d580b5-1228-4b81-9531-098711a99cee","58cc52be-cec3-4c2c-b650-a8b43674aa22"]
```

DataLoader виконує batching запитів у межах одного GraphQL request і кешує результати в межах request.

## Приклад query

```graphql
query ExampleQuery($pagination: OrdersPaginationInput) {
  orders(pagination: $pagination) {
    nodes {
      createdAt
      id
      idempotencyKey
      items {
        id
        priceAtPurchase
        product {
          category
          createdAt
          id
          isActive
          price
          purchasePolicy
          stock
          title
          type
          updatedAt
        }
        quantity
      }
      status
      updatedAt
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    totalCount
  }
}

{
  "pagination": {
    "cursor": null,
    "limit": 2
  }
}
```
