import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { CurrentUser } from "../common/errors/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import type { AuthUser } from "../auth/types";
import { PresignUploadDto } from "./dto/presign-upload.dto";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { FileType } from "./enums/file-type.enum";
import { UsersService } from "../users/users.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @Post("presign")
  async presignUpload(
    @CurrentUser() user: AuthUser,
    @Body() dto: PresignUploadDto,
  ) {
    return this.filesService.presignUpload(user.id, dto);
  }

  @Post("complete")
  async completeUpload(
    @CurrentUser() user: AuthUser,
    @Body() dto: CompleteUploadDto,
  ) {
    const file = await this.filesService.completeUpload(user.id, dto.fileId);

    switch (file.type) {
      case FileType.AVATAR:
        await this.usersService.attachAvatar(user.id, file.id);
        break;

      default:
        throw new BadRequestException("Unsupported file type");
    }

    return {
      fileId: file.id,
      status: file.status,
    };
  }

  @Get(":fileId")
  async getFile(@Param("fileId") fileId: string, @CurrentUser() user?: any) {
    return this.filesService.getFile(fileId, user?.id);
  }
}
