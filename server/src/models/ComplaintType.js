import mongoose from "mongoose";

const complaintTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

complaintTypeSchema.index({ departmentId: 1, name: 1 }, { unique: true });

export default mongoose.model("ComplaintType", complaintTypeSchema);
