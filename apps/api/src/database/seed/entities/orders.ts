type SeedOrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  priceAtPurchase: string;
};

type SeedOrder = {
  id: string;
  idempotencyKey: string;
  userEmail: string;
  items: SeedOrderItem[];
};

export const ordersSeed: SeedOrder[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    idempotencyKey: "idem-11111111-1111-1111-1111-111111111111",
    userEmail: "lio@example.com",
    items: [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        productTitle: "Celebration Bundle: Family",
        quantity: 1,
        priceAtPurchase: "5.00",
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
        productTitle: "Support WeJourney",
        quantity: 1,
        priceAtPurchase: "5.00",
      },
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    idempotencyKey: "idem-22222222-2222-2222-2222-222222222222",
    userEmail: "dan@example.com",
    items: [
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
        productTitle: "Journey Theme: Space",
        quantity: 1,
        priceAtPurchase: "9.00",
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
        productTitle: "WeJourney Poster",
        quantity: 2,
        priceAtPurchase: "15.00",
      },
    ],
  },
];
