import { randomUUID } from "crypto";
import { FileType } from "../enums/file-type.enum";

export function generateKey(
  entity: string,
  entityId: string,
  folder: string,
  extension: string,
): string {
  const uuid = randomUUID();

  return `${entity}/${entityId}/${folder}/${uuid}.${extension}`;
}
export function generateUserAvatarKey(userId: string, ext: string) {
  return generateKey("users", userId, "avatars", ext);
}

export function generateFileKey(
  type: FileType,
  userId: string,
  extension: string,
): { key: string; entityId: string } {
  switch (type) {
    case FileType.AVATAR:
      return {
        key: generateUserAvatarKey(userId, extension),
        entityId: userId,
      };

    default:
      throw new Error("Unsupported file type");
  }
}
