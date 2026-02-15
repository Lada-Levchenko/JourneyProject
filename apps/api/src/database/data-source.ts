import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [path.resolve(__dirname, "../**/*.entity.{ts,js}")],
  migrations: [path.resolve(__dirname, "migrations/**/*.{ts,js}")],

  synchronize: false,
});
