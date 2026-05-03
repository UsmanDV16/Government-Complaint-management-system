import { Router } from "express";
import { streamFile } from "../controllers/fileController.js";

const router = Router();

router.get("/:id", streamFile);

export default router;
