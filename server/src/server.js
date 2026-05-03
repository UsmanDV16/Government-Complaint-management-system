import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDb } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const port = process.env.PORT || 4000;

async function start() {
  await connectDb();
  await seedAdmin();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Startup error", err);
  process.exit(1);
});
