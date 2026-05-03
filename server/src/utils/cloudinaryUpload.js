import { v2 as cloudinary } from "cloudinary";
import { configureCloudinary } from "../config/cloudinary.js";

export async function uploadBuffer(file, folder) {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format
        });
      }
    );
    stream.end(file.buffer);
  });
}

export async function uploadFiles(files, folder) {
  if (!files || files.length === 0) {
    return [];
  }
  return Promise.all(files.map((file) => uploadBuffer(file, folder)));
}
