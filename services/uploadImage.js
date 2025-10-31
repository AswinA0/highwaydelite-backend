import { cloudinary } from "../config/cloudinary.js";
export const uploadImage = (file, folder) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });
};
