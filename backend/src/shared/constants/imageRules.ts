export const IMAGE_RULES = {
  MAX_IMAGES_PER_STADIUM: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;