import { Router } from "express";
import { loginCitizen, loginStaff, me, registerCitizen } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerCitizen);
router.post("/login", loginCitizen);
router.post("/staff-login", loginStaff);
router.get("/me", authRequired, me);

export default router;
