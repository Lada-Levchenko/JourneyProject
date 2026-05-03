import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";

import { ProductsController } from "../products/product.controller";
import { ProductsService } from "../products/products.service";

jest.setTimeout(30000);

describe("Products (e2e)", () => {
  let app: INestApplication | undefined;

  const productsServiceMock = {
    listProducts: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    productsServiceMock.listProducts.mockResolvedValue({
      products: [],
      nextCursor: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should return 400 if type is missing", async () => {
    await request(app!.getHttpServer()).get("/products").expect(400);

    expect(productsServiceMock.listProducts).not.toHaveBeenCalled();
  });

  it("should call service with correct params", async () => {
    await request(app!.getHttpServer())
      .get("/products")
      .query({
        type: "physical",
        category: "books",
        limit: "5",
      })
      .expect(200);

    expect(productsServiceMock.listProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "physical",
        category: "books",
        limit: 5,
      }),
    );
  });
});
