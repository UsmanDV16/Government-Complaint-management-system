import { Router } from "express";
import {
  createType,
  deleteType,
  listTypes,
  updateType
} from "../controllers/complaintTypeController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/departments/:departmentId/types", listTypes);
router.post(
  "/departments/:departmentId/types",
  authRequired,
  requireRole(["department", "admin"]),
  createType
);
router.patch("/types/:id", authRequired, requireRole(["department", "admin"]), updateType);
router.delete(
  "/types/:id",
  authRequired,
  requireRole(["department", "admin"]),
  deleteType
);

export default router;
