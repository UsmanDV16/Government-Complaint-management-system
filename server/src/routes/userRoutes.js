import { Router } from "express";
import {
  createDepartmentUser,
  deleteUser,
  listUsers,
  updateUser
} from "../controllers/userController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, requireRole(["admin"]));

router.get("/", listUsers);
router.post("/", createDepartmentUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
