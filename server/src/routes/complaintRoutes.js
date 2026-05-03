import { Router } from "express";
import {
  createComplaint,
  departmentUpdate,
  getComplaint,
  listComplaints,
  rateComplaint,
  verifyComplaint,
  citizenVerifyComplaint,
  adminReviewComplaint
} from "../controllers/complaintController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(authRequired);

router.get("/", listComplaints);
router.get("/:id", getComplaint);
router.post("/", requireRole(["citizen"]), upload.array("proofs", 6), createComplaint);
router.patch(
  "/:id/department-update",
  requireRole(["department"]),
  upload.array("resolutionProofs", 6),
  departmentUpdate
);
router.patch("/:id/citizen-verify", requireRole(["citizen"]), upload.array("proofs", 6), citizenVerifyComplaint);
router.patch("/:id/admin-review", requireRole(["admin"]), adminReviewComplaint);
router.patch("/:id/verify", requireRole(["admin"]), verifyComplaint); // Legacy endpoint
router.post("/:id/rating", requireRole(["citizen"]), rateComplaint); // For accepted complaints

export default router;
