import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("processed_messages")
@Index(["handler", "messageId"], { unique: true })
@Index(["handler", "idempotencyKey"], {
  unique: true,
  where: '"idempotency_key" IS NOT NULL',
})
export class ProcessedMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  handler: string;

  @Column({ type: "varchar", length: 200, name: "message_id" })
  messageId: string;

  @Column({
    type: "varchar",
    length: 200,
    name: "idempotency_key",
    nullable: true,
  })
  idempotencyKey: string | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;
}
