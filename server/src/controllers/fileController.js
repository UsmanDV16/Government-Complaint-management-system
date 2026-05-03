import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getGridFsBucket } from "../utils/gridfsUpload.js";

export const streamFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid file id." });
  }

  const objectId = new mongoose.Types.ObjectId(id);
  const bucket = getGridFsBucket();
  const files = await bucket.find({ _id: objectId }).toArray();

  if (!files.length) {
    return res.status(404).json({ message: "File not found." });
  }

  const file = files[0];
  res.setHeader("Content-Type", file.contentType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);

  const readStream = bucket.openDownloadStream(objectId);
  readStream.on("error", () => {
    if (!res.headersSent) {
      res.status(500).json({ message: "Unable to read file." });
    }
  });
  readStream.pipe(res);
});
