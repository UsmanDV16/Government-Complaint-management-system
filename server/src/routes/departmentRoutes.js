import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment
} from "../controllers/departmentController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listDepartments);
router.post("/", authRequired, requireRole(["admin"]), createDepartment);
router.patch("/:id", authRequired, requireRole(["admin"]), updateDepartment);
router.delete("/:id", authRequired, requireRole(["admin"]), deleteDepartment);

export default router;
