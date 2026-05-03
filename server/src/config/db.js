import mongoose from "mongoose";
import User from "../models/User.js";
import { setGridFsBucket } from "../utils/gridfsUpload.js";

export async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  setGridFsBucket(mongoose.connection.db);
  await User.syncIndexes();
  console.log("MongoDB connected");
}
