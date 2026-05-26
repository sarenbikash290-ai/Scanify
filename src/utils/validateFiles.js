const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const validateFiles = (newFiles, existingImages) => {
  const errors = [];
  const validFiles = [];

  newFiles.forEach((file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" is not supported. Use JPG or PNG only.`);
      return;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      errors.push(`"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Check duplicate (compare file name + size as a simple fingerprint)
    const isDuplicate = existingImages.some(
      (img) => img.file.name === file.name && img.file.size === file.size
    );
    if (isDuplicate) {
      errors.push(`"${file.name}" is already added.`);
      return;
    }

    validFiles.push(file);
  });

  return { validFiles, errors };
};

export default validateFiles;