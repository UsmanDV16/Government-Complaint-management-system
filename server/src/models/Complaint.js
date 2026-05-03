import mongoose from "mongoose";

const proofSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    stars: { type: Number, min: 1, max: 5 },
    review: { type: String, trim: true },
    updatedAt: { type: Date }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    typeId: { type: mongoose.Schema.Types.ObjectId, ref: "ComplaintType" },
    status: {
      type: String,
      enum: ["unresolved", "department_resolving", "citizen_verifying", "accepted", "declined", "admin_reviewing", "reassigned"],
      default: "unresolved"
    },
    departmentNotes: { type: String, trim: true },
    citizenDeclineReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    resolutionTimeHours: { type: Number, min: 0 },
    submittedAt: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    departmentResolvedAt: { type: Date },
    citizenAcceptedAt: { type: Date },
    citizenDeclinedAt: { type: Date },
    adminActionAt: { type: Date },
    citizenProofs: [proofSchema],
    departmentProofs: [proofSchema],
    citizenDeclineProofs: [proofSchema],
    citizenRating: ratingSchema,
    reassignmentCount: { type: Number, default: 0 },
    previousDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
