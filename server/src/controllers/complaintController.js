import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import ComplaintType from "../models/ComplaintType.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiles } from "../utils/gridfsUpload.js";

const POPULATE = [
  { path: "departmentId", select: "name" },
  { path: "previousDepartmentId", select: "name" },
  { path: "citizenId", select: "name cnic email username" },
  { path: "typeId", select: "name" }
];

export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, departmentId, typeId } = req.body;
  if (!title || !description || !departmentId) {
    return res
      .status(400)
      .json({ message: "Title, description, and department are required." });
  }
  const department = await Department.findById(departmentId);
  if (!department) {
    return res.status(404).json({ message: "Department not found." });
  }
  if (typeId) {
    const type = await ComplaintType.findOne({ _id: typeId, departmentId });
    if (!type) {
      return res.status(400).json({ message: "Invalid complaint type." });
    }
  }

  const folder = process.env.GRIDFS_BUCKET || "uploads";
  const uploads = await uploadFiles(req.files, `${folder}/citizen`);
  const proofs = uploads.map((file) => ({
    url: file.url,
    publicId: file.publicId,
    uploadedBy: req.user._id
  }));

  const complaint = await Complaint.create({
    title: title.trim(),
    description: description.trim(),
    citizenId: req.user._id,
    departmentId,
    typeId: typeId || undefined,
    status: "unresolved",
    citizenProofs: proofs,
    submittedAt: new Date(),
    priority: req.body.priority || undefined
  });

  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.status(201).json({ complaint: populated });
});

export const listComplaints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "citizen") {
    filter.citizenId = req.user._id;
  }
  if (req.user.role === "department") {
    filter.departmentId = req.user.departmentId;
  }
  // Allow optional filtering by priority
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  let complaints = await Complaint.find(filter).populate(POPULATE);

  // Support sorting by priority when requested (high -> medium -> low)
  if (req.query.sort === "priority") {
    const order = { high: 3, medium: 2, low: 1 };
    complaints = complaints.sort((a, b) => (order[b.priority || "medium"] || 2) - (order[a.priority || "medium"] || 2));
  } else {
    complaints = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (req.user.role === "citizen") {
    const sanitized = complaints.map((complaint) => {
      const obj = complaint.toObject ? complaint.toObject() : complaint;
      delete obj.resolutionTimeHours;
      return obj;
    });
    return res.json({ complaints: sanitized });
  }

  res.json({ complaints });
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(POPULATE);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  if (req.user.role === "citizen" && !complaint.citizenId.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (
    req.user.role === "department" &&
    !complaint.departmentId._id.equals(req.user.departmentId)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.role === "citizen") {
    const sanitized = complaint.toObject ? complaint.toObject() : complaint;
    delete sanitized.resolutionTimeHours;
    return res.json({ complaint: sanitized });
  }

  res.json({ complaint });
});

export const departmentUpdate = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  if (!complaint.departmentId.equals(req.user.departmentId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { departmentNotes, resolutionTimeHours, priority } = req.body;
  const isResolutionSubmit = departmentNotes !== undefined || (req.files && req.files.length > 0) || resolutionTimeHours !== undefined;
  if (isResolutionSubmit && complaint.status !== "unresolved") {
    return res.status(400).json({ message: "Only unresolved complaints can be resolved." });
  }
  const folder = process.env.GRIDFS_BUCKET || "uploads";
  const uploads = await uploadFiles(req.files, `${folder}/department`);
  const proofs = uploads.map((file) => ({
    url: file.url,
    publicId: file.publicId,
    uploadedBy: req.user._id
  }));

  if (departmentNotes !== undefined) {
    complaint.departmentNotes = departmentNotes ? departmentNotes.trim() : "";
  }
  if (resolutionTimeHours !== undefined && resolutionTimeHours !== "") {
    complaint.resolutionTimeHours = Number(resolutionTimeHours);
  }
  if (priority !== undefined) {
    const allowed = ["low", "medium", "high"];
    if (allowed.includes(priority)) {
      complaint.priority = priority;
    }
  }
  complaint.departmentProofs = [...(complaint.departmentProofs || []), ...proofs];
  complaint.status = "citizen_verifying";
  complaint.departmentResolvedAt = new Date();

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.json({ complaint: populated });
});

export const verifyComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }

  const { departmentId, adminNotes } = req.body;
  const wantsReassign =
    departmentId && departmentId !== complaint.departmentId.toString();

  if (!wantsReassign && complaint.status !== "resolved") {
    return res
      .status(400)
      .json({ message: "Only resolved complaints can be verified." });
  }

  if (wantsReassign) {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    complaint.departmentId = departmentId;
    complaint.status = "unresolved";
    complaint.verifiedAt = null;
    complaint.resolvedAt = null;
    complaint.resolutionTimeHours = null;
    complaint.departmentNotes = "";
    complaint.departmentProofs = [];
    complaint.rating = undefined;
    complaint.typeId = undefined;
  } else {
    complaint.status = "verified";
    complaint.verifiedAt = new Date();
  }
  if (adminNotes !== undefined) {
    complaint.adminNotes = adminNotes ? adminNotes.trim() : "";
  }

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.json({ complaint: populated });
});

export const rateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  if (!complaint.citizenId.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (complaint.status !== "accepted") {
    return res.status(400).json({ message: "You can rate only after accepting the resolution." });
  }

  const stars = Number(req.body.stars);
  const review = req.body.review ? req.body.review.trim() : "";
  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ message: "Stars must be between 1 and 5." });
  }

  complaint.citizenRating = {
    stars,
    review,
    updatedAt: new Date()
  };

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.json({ complaint: populated });
});

export const citizenVerifyComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  if (!complaint.citizenId.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (complaint.status !== "citizen_verifying") {
    return res.status(400).json({ message: "Complaint is not ready for citizen verification." });
  }

  const { accept, declineReason } = req.body;
  const isAccept = String(accept).toLowerCase() === "true";
  const folder = process.env.GRIDFS_BUCKET || "uploads";

  if (isAccept) {
    const uploadedFiles = req.files && req.files.length > 0
      ? await uploadFiles(req.files, `${folder}/citizen-response`)
      : [];
    const responseProofs = uploadedFiles.map((file) => ({
      url: file.url,
      publicId: file.publicId,
      uploadedBy: req.user._id
    }));

    complaint.status = "accepted";
    complaint.citizenAcceptedAt = new Date();
    if (responseProofs.length > 0) {
      complaint.citizenProofs = [...(complaint.citizenProofs || []), ...responseProofs];
    }

    const starsValue = req.body.stars !== undefined && req.body.stars !== ""
      ? Number(req.body.stars)
      : null;
    const review = req.body.review ? req.body.review.trim() : "";
    if (review && !starsValue) {
      return res.status(400).json({ message: "Select a rating before submitting a review." });
    }
    if (starsValue) {
      if (starsValue < 1 || starsValue > 5) {
        return res.status(400).json({ message: "Stars must be between 1 and 5." });
      }
      complaint.citizenRating = {
        stars: starsValue,
        review,
        updatedAt: new Date()
      };
    }
  } else {
    if (!declineReason || !declineReason.trim()) {
      return res.status(400).json({ message: "Please provide a reason for declining." });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one proof is required when declining a resolution." });
    }
    const uploadedFiles = req.files && req.files.length > 0
      ? await uploadFiles(req.files, `${folder}/citizen-response`)
      : [];
    const responseProofs = uploadedFiles.map((file) => ({
      url: file.url,
      publicId: file.publicId,
      uploadedBy: req.user._id
    }));

    complaint.status = "admin_reviewing";
    complaint.citizenDeclinedAt = new Date();
    complaint.citizenDeclineReason = declineReason ? declineReason.trim() : "";
    complaint.citizenDeclineProofs = responseProofs;
  }

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.json({ complaint: populated });
});

export const adminReviewComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  if (complaint.status !== "admin_reviewing") {
    return res.status(400).json({ message: "Complaint is not under admin review." });
  }

  const { action, departmentId, adminNotes } = req.body;
  // action: "reassign" or "decline"

  if (action === "reassign") {
    // If new departmentId provided, reassign to different department
    // Otherwise, keep same department and let them try again
    if (departmentId && departmentId !== complaint.departmentId.toString()) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found." });
      }
      complaint.previousDepartmentId = complaint.departmentId;
      complaint.departmentId = departmentId;
    }

    complaint.reassignmentCount = (complaint.reassignmentCount || 0) + 1;
    
    // Clear old department proofs for new attempt (keep decline proofs in history)
    complaint.departmentProofs = [];
    complaint.departmentNotes = "";
    complaint.resolutionTimeHours = null;
    // Also clear citizen's decline data so the complaint is like new after reassignment
    complaint.citizenDeclineProofs = [];
    complaint.citizenDeclineReason = "";
    complaint.citizenDeclinedAt = null;
    
    // Reset to unresolved so department can resolve again
    complaint.status = "unresolved";
  } else if (action === "decline") {
    complaint.status = "declined";
  } else {
    return res.status(400).json({ message: "Invalid action. Use 'reassign' or 'decline'." });
  }

  if (adminNotes !== undefined) {
    complaint.adminNotes = adminNotes ? adminNotes.trim() : "";
  }
  complaint.adminActionAt = new Date();

  await complaint.save();
  const populated = await Complaint.findById(complaint._id).populate(POPULATE);
  res.json({ complaint: populated });
});
