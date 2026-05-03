import ComplaintType from "../models/ComplaintType.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTypes = asyncHandler(async (req, res) => {
  const types = await ComplaintType.find({
    departmentId: req.params.departmentId,
    isActive: true
  }).sort({ name: 1 });
  res.json({ types });
});

export const createType = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Type name is required." });
  }
  if (
    req.user?.role === "department" &&
    req.user.departmentId?.toString() !== req.params.departmentId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const type = await ComplaintType.create({
    name: name.trim(),
    departmentId: req.params.departmentId
  });
  res.status(201).json({ type });
});

export const updateType = asyncHandler(async (req, res) => {
  const { name, isActive } = req.body;
  const update = {};
  if (name) update.name = name.trim();
  if (isActive !== undefined) update.isActive = isActive;

  const type = await ComplaintType.findById(req.params.id);
  if (!type) {
    return res.status(404).json({ message: "Type not found." });
  }
  if (
    req.user?.role === "department" &&
    req.user.departmentId?.toString() !== type.departmentId.toString()
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  Object.assign(type, update);
  await type.save();
  if (!type) {
    return res.status(404).json({ message: "Type not found." });
  }
  res.json({ type });
});

export const deleteType = asyncHandler(async (req, res) => {
  const type = await ComplaintType.findById(req.params.id);
  if (!type) {
    return res.status(404).json({ message: "Type not found." });
  }
  if (
    req.user?.role === "department" &&
    req.user.departmentId?.toString() !== type.departmentId.toString()
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await type.deleteOne();
  res.status(204).send();
});
