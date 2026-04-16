import { MigrationInterface, QueryRunner } from "typeorm";

export class FileRecord1773093896351 implements MigrationInterface {
  name = "FileRecord1773093896351";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."file_record_type_enum" AS ENUM('avatar', 'background', 'task_cover', 'celebration_photo', 'attachment')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_record_status_enum" AS ENUM('pending', 'ready')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_record_visibility_enum" AS ENUM('private', 'public')`,
    );
    await queryRunner.query(
      `CREATE TABLE "file_record" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" character varying NOT NULL, "entityId" character varying, "type" "public"."file_record_type_enum" NOT NULL, "key" character varying NOT NULL, "contentType" character varying NOT NULL, "size" integer NOT NULL, "status" "public"."file_record_status_enum" NOT NULL DEFAULT 'pending', "visibility" "public"."file_record_visibility_enum" NOT NULL DEFAULT 'private', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_16ca009355a1f732909b3ff477b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "file_record"`);
    await queryRunner.query(`DROP TYPE "public"."file_record_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."file_record_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."file_record_type_enum"`);
  }
}
