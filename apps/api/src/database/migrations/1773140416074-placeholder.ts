import { MigrationInterface, QueryRunner } from "typeorm";

export class AvatarFileId1773140416074 implements MigrationInterface {
  name = "AvatarFileId1773140416074";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "avatarFileId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5e896b85466a93e7265be386b0" ON "file_record" ("key") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0385975205391a13e1d5d884f82" FOREIGN KEY ("avatarFileId") REFERENCES "file_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_0385975205391a13e1d5d884f82"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e896b85466a93e7265be386b0"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarFileId"`);
  }
}
