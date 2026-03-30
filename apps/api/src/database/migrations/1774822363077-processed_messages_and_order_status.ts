import { MigrationInterface, QueryRunner } from "typeorm";

export class ProcessedMessagesAndOrderStatus1774822363077
  implements MigrationInterface
{
  name = "ProcessedMessagesAndOrderStatus1774822363077";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "processed_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "handler" character varying(100) NOT NULL, "message_id" character varying(200) NOT NULL, "idempotency_key" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_61d06681389f1e78ca233e08d55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dd00d3ef4a490ac4c627ea78bd" ON "processed_messages" ("handler", "idempotency_key") WHERE "idempotency_key" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9f042159a7d626ae3e83ff4cda" ON "processed_messages" ("handler", "message_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('CREATED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum_old" AS ENUM('CREATED', 'PAID', 'CANCELLED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "processed_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f042159a7d626ae3e83ff4cda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd00d3ef4a490ac4c627ea78bd"`,
    );
    await queryRunner.query(`DROP TABLE "processed_messages"`);
  }
}
