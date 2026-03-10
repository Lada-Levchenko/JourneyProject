export function getExtension(contentType: string) {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };

  return map[contentType] ?? "bin";
}
