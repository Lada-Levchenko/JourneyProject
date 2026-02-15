import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Product } from "./product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(title: string, price: string): Promise<Product> {
    const product = this.productsRepository.create({ title, price });
    return this.productsRepository.save(product);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.productsRepository.find({ where: { id: In(ids) } });
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  // example body:
  // {
  //   "type": "course",
  //   "category": "development",
  //   "search": "nestjs",
  //   "cursor": "some-product-id",
  //   "limit": 10
  // }
  async listProducts(options: {
    type: string;
    category?: string;
    search?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ products: Product[]; nextCursor: string | null }> {
    const { type, category, search, cursor, limit } = options;

    const query = this.productsRepository.createQueryBuilder("product");

    if (type) {
      query.andWhere("product.type = :type", { type });
    }

    if (category) {
      query.andWhere("product.category = :category", { category });
    }

    if (search) {
      query.andWhere("product.title ILIKE :search", { search: `%${search}%` });
    }

    if (cursor) {
      query.andWhere("product.id > :cursor", { cursor });
    }

    query.orderBy("product.id", "ASC");

    if (limit > 0) {
      query.limit(limit + 1);
    }

    console.log("SQL:", query.getQueryAndParameters());

    const products = await query.getMany();

    let nextCursor: string | null = null;
    if (limit > 0 && products.length > limit) {
      const nextProduct = products.pop();
      if (nextProduct) {
        nextCursor = nextProduct.id;
      }
    }
    return { products, nextCursor };
  }
}
