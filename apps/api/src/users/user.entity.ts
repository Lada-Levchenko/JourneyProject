import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "../orders/order.entity";
import { GlobalRole } from "./global-role.enum";
import { FileRecord } from "../files/file-record.entity";

@Entity("users")
@Index("IDX_users_email_unique", ["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 320 })
  email: string;

  @Column({
    type: "varchar",
    length: 255,
    name: "password_hash",
    nullable: true,
    select: false,
  })
  passwordHash?: string | null;

  @Column({
    type: "enum",
    enum: GlobalRole,
    enumName: "global_role_enum",
    default: GlobalRole.USER,
  })
  globalRole: GlobalRole;

  @Column({ nullable: true })
  avatarFileId?: string;

  @ManyToOne(() => FileRecord)
  @JoinColumn({ name: "avatarFileId" })
  avatarFile?: FileRecord;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;
}
