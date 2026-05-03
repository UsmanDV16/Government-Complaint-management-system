import mongoose from "mongoose";

let gridFsBucket = null;

export function setGridFsBucket(db) {
  const bucketName = process.env.GRIDFS_BUCKET || "uploads";
  gridFsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName });
}

export function getGridFsBucket() {
  if (!gridFsBucket) {
    throw new Error("GridFS bucket is not initialized");
  }
  return gridFsBucket;
}

function sanitizeFileName(name) {
  return String(name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadBuffer(file, folder) {
  const bucket = getGridFsBucket();
  const safeName = sanitizeFileName(file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype || "application/octet-stream",
      metadata: {
        folder,
        originalName: file.originalname || filename
      }
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", (doc) => {
      const fileId = doc?._id || uploadStream.id;
      const id = fileId.toString();
      resolve({
        url: `/api/files/${id}`,
        publicId: id,
        bytes: doc?.length || file.buffer?.length || 0,
        format: file.mimetype || "application/octet-stream"
      });
    });

    uploadStream.end(file.buffer);
  });
}

export async function uploadFiles(files, folder) {
  if (!files || files.length === 0) {
    return [];
  }
  return Promise.all(files.map((file) => uploadBuffer(file, folder)));
}
