import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOrderStatus1775425981049 implements MigrationInterface {
  name = "AlterOrderStatus1775425981049";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."orders_status_enum"
      RENAME TO "orders_status_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum" AS ENUM(
        'CREATED',
        'PAYMENT_PENDING',
        'PAID',
        'PAYMENT_FAILED',
        'PROCESSING',
        'PROCESSING_FAILED',
        'COMPLETED',
        'CANCELLED'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status"
      TYPE "public"."orders_status_enum"
      USING (
        CASE "status"::text
          WHEN 'PENDING' THEN 'PAYMENT_PENDING'
          WHEN 'FAILED' THEN 'PAYMENT_FAILED'
          ELSE "status"::text
        END
      )::"public"."orders_status_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status" SET DEFAULT 'CREATED'
    `);

    await queryRunner.query(`
      DROP TYPE "public"."orders_status_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum_old" AS ENUM(
        'CREATED',
        'PENDING',
        'PROCESSING',
        'PAID',
        'FAILED',
        'CANCELLED',
        'COMPLETED'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status"
      TYPE "public"."orders_status_enum_old"
      USING (
        CASE "status"::text
          WHEN 'PAYMENT_PENDING' THEN 'PENDING'
          WHEN 'PAYMENT_FAILED' THEN 'FAILED'
          WHEN 'PROCESSING_FAILED' THEN 'FAILED'
          ELSE "status"::text
        END
      )::"public"."orders_status_enum_old"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "status" SET DEFAULT 'CREATED'
    `);

    await queryRunner.query(`
      DROP TYPE "public"."orders_status_enum"
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."orders_status_enum_old"
      RENAME TO "orders_status_enum"
    `);
  }
}
