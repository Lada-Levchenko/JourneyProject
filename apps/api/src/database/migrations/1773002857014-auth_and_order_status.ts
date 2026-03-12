import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthAndOrderStatus1773002857014 implements MigrationInterface {
  name = "AuthAndOrderStatus1773002857014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."products_type_idx"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_hash" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."global_role_enum" AS ENUM('user', 'super_admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "globalRole" "public"."global_role_enum" NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "globalRole"`);
    await queryRunner.query(`DROP TYPE "public"."global_role_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    await queryRunner.query(
      `CREATE INDEX "products_type_idx" ON "products" ("category", "type") `,
    );
  }
}
