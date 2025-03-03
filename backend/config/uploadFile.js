import fs from "fs";
import path from "path";

/**
 * Handles file upload with validation.
 * @param {File} file - The uploaded file.
 * @param {string} uploadDir - The directory where the file should be saved.
 * @param {Array<string>} allowedTypes - List of allowed MIME types.
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB).
 * @returns {Promise<string>} - The file path if upload is successful.
 */

export const uploadFile = async (
  file,
  uploadDir,
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/heic",
    "image/heif",
  ],
  maxSize = 5 * 1024 * 1024 // 5MB
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        reject(new Error("No file uploaded"));
      }

      if (!allowedTypes.includes(file.type)) {
        reject(
          new Error(
            `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`
          )
        );
      }

      if (file.size > maxSize) {
        reject(new Error("File size exceeds limit"));
      }

      // convert file to buffer
      const byteData = await file.arrayBuffer();
      const buffer = Buffer.from(byteData);

      // Generate a unique filename
      const uniquePrefix = Date.now();
      const sanitizedFileName = file.name.replace(/\s+/g, "_"); // Replace spaces with underscores
      const fileName = `${uniquePrefix}_${sanitizedFileName}`;

      // Create the upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move the file to the upload directory
      const filePath = path.join(uploadDir, fileName);

      // Write the buffer to the file
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          reject(new Error("File upload failed"));
        } else {
          resolve(filePath);
        }
      });
    } catch (error) {
      reject(new Error("File upload failed" + error.message));
    }
  });
};
