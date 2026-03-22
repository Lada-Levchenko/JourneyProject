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
  HeadObjectCommand,
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
  private s3Internal: S3Client;
  private s3External: S3Client;
  private readonly s3Bucket: string;
  private readonly s3ExternalEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FileRecord)
    private readonly filesRepository: Repository<FileRecord>,
  ) {
    this.s3Bucket = this.configService.get<string>("AWS_S3_BUCKET")!;
    this.s3ExternalEndpoint =
      this.configService.get<string>("AWS_S3_EXTERNAL_ENDPOINT") ||
      this.configService.get<string>("AWS_S3_ENDPOINT")!;
    const region = this.configService.get<string>("AWS_REGION");
    const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID")!;
    const secretAccessKey = this.configService.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    )!;

    this.s3Internal = new S3Client({
      region,
      endpoint: this.configService.get<string>("AWS_S3_ENDPOINT")!,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.s3External = new S3Client({
      region,
      endpoint: this.s3ExternalEndpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
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
    });

    const uploadUrl = await getSignedUrl(this.s3External, command, {
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

    const meta = await this.getObjectMeta(file.key);

    if (!meta.exists) {
      throw new BadRequestException("File was not uploaded to storage");
    }

    file.status = FileStatus.READY;
    file.size = meta.size;
    file.contentType = meta.contentType ?? file.contentType;

    await this.filesRepository.save(file);

    return file;
  }

  getFileUrl(key: string) {
    // TODO: implement CloudFront
    const endpoint = this.s3ExternalEndpoint;
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

    return getSignedUrl(this.s3External, command, {
      expiresIn: 300,
    });
  }

  async getSignedDownloadUrlByFileId(fileId: string) {
    const file = await this.getFile(fileId);
    return this.getSignedDownloadUrl(file.key);
  }

  async getObjectMeta(key: string) {
    try {
      const result = await this.s3Internal.send(
        new HeadObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
      );

      return {
        exists: true,
        size: result.ContentLength || 0,
        contentType: result.ContentType,
      };
    } catch (e: any) {
      console.log("HeadObject error:", e.name);
      return {
        exists: false,
        size: 0,
        contentType: null,
      };
    }
  }
}
