import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

import { FileStatus } from "./enums/file-status.enum";
import { FileVisibility } from "./enums/file-visibility.enum";
import { FileType } from "./enums/file-type.enum";

@Entity()
export class FileRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ownerId: string;

  @Column({ nullable: true })
  entityId?: string;

  @Column({
    type: "enum",
    enum: FileType,
  })
  type: FileType;

  @Index()
  @Column()
  key: string;

  @Column()
  contentType: string;

  @Column("int")
  size: number;

  @Column({
    type: "enum",
    enum: FileStatus,
    default: FileStatus.PENDING,
  })
  status: FileStatus;

  @Column({
    type: "enum",
    enum: FileVisibility,
    default: FileVisibility.PRIVATE,
  })
  visibility: FileVisibility;

  @CreateDateColumn()
  createdAt: Date;
}
