import Department from "../models/Department.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ departments });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Department name is required." });
  }
  const department = await Department.create({
    name: name.trim(),
    description: description ? description.trim() : undefined
  });
  res.status(201).json({ department });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const update = {};
  if (name) update.name = name.trim();
  if (description !== undefined) update.description = description.trim();
  if (isActive !== undefined) update.isActive = isActive;

  const department = await Department.findByIdAndUpdate(req.params.id, update, {
    new: true
  });
  if (!department) {
    return res.status(404).json({ message: "Department not found." });
  }
  res.json({ department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return res.status(404).json({ message: "Department not found." });
  }
  res.status(204).send();
});
