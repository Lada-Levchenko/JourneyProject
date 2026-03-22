import { IsEnum, IsString } from "class-validator";
import { FileType } from "../enums/file-type.enum";

export class PresignUploadDto {
  @IsEnum(FileType)
  fileType: FileType;

  @IsString()
  contentType: string;
}
