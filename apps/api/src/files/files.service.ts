import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { FileRecord } from "./file-record.entity";
import { FileStatus } from "./enums/file-status.enum";

import { generateFileKey } from "./utils/file-key.util";
import { getExtension } from "./utils/get-extension.util";
import { PresignUploadDto } from "./dto/presign-upload.dto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileVisibility } from "./enums/file-visibility.enum";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly s3Bucket: string;
  private readonly s3Endpoint: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FileRecord)
    private readonly filesRepository: Repository<FileRecord>,
  ) {
    this.s3Bucket = this.configService.get<string>("AWS_S3_BUCKET")!;
    this.s3Endpoint = this.configService.get<string>("AWS_S3_ENDPOINT")!;
    this.s3 = new S3Client({
      region: this.configService.get<string>("AWS_REGION"),
      endpoint: this.s3Endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY",
        )!,
      },
      forcePathStyle: true,
    });
  }

  async presignUpload(userId: string, dto: PresignUploadDto) {
    const extension = getExtension(dto.contentType);

    const { key, entityId } = generateFileKey(dto.fileType, userId, extension);

    const file = this.filesRepository.create({
      ownerId: userId,
      entityId,
      type: dto.fileType,
      key,
      contentType: dto.contentType,
      size: 0,
      status: FileStatus.PENDING,
      visibility: FileVisibility.PRIVATE,
    });

    await this.filesRepository.save(file);

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ContentType: dto.contentType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return {
      fileId: file.id,
      key,
      uploadUrl,
      contentType: dto.contentType,
    };
  }

  async completeUpload(userId: string, fileId: string) {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException("File does not belong to user");
    }

    if (file.status !== FileStatus.PENDING) {
      throw new BadRequestException("File already completed");
    }

    file.status = FileStatus.READY;

    await this.filesRepository.save(file);

    return file;
  }

  getFileUrl(key: string) {
    // TODO: implement CloudFront
    const endpoint = this.s3Endpoint;
    const bucket = this.s3Bucket;

    return `${endpoint}/${bucket}/${key}`;
  }

  async getFile(fileId: string, userId?: string) {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException();
    }

    if (file.visibility === FileVisibility.PRIVATE && file.ownerId !== userId) {
      throw new ForbiddenException();
    }

    let url: string;

    if (file.visibility === FileVisibility.PUBLIC) {
      url = this.getFileUrl(file.key);
    } else {
      url = await this.getSignedDownloadUrl(file.key);
    }

    return {
      id: file.id,
      key: file.key,
      url,
      contentType: file.contentType,
      size: file.size,
    };
  }

  async getSignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });
  }

  async getSignedDownloadUrlByFileId(fileId: string) {
    const file = await this.getFile(fileId);
    return this.getSignedDownloadUrl(file.key);
  }
}
