import bcrypt from "bcryptjs";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeUser } from "../utils/token.js";

const normalizeUsername = (value) => value.trim().toLowerCase();

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.q) {
    const q = req.query.q.trim();
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { name: regex },
        { cnic: regex },
        { email: regex },
        { username: regex }
      ];
    }
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(sanitizeUser) });
});

export const createDepartmentUser = asyncHandler(async (req, res) => {
  const { name, cnic, email, password, departmentId, username } = req.body;
  if (!name || !cnic || !password || !departmentId || !username) {
    return res
      .status(400)
      .json({ message: "Name, CNIC, username, password, and department are required." });
  }
  const normalizedUsername = normalizeUsername(username);
  const checks = [{ cnic: cnic.trim() }, { username: normalizedUsername }];
  if (email) {
    checks.push({ email: email.trim().toLowerCase() });
  }
  const existing = await User.findOne({ $or: checks });
  if (existing) {
    return res.status(409).json({ message: "CNIC, username, or email already exists." });
  }
  const department = await Department.findById(departmentId);
  if (!department) {
    return res.status(404).json({ message: "Department not found." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    username: normalizedUsername,
    cnic: cnic.trim(),
    email: email ? email.trim().toLowerCase() : undefined,
    passwordHash,
    role: "department",
    departmentId,
    isActive: true
  });
  res.status(201).json({ user: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, cnic, password, departmentId, isActive, username } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  if (name) user.name = name.trim();
  if (email !== undefined) {
    const normalizedEmail = email ? email.trim().toLowerCase() : "";
    user.email = normalizedEmail || undefined;
  }
  if (cnic) user.cnic = cnic.trim();
  if (departmentId !== undefined) user.departmentId = departmentId || null;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  if (username !== undefined) {
    const normalizedUsername = username ? normalizeUsername(username) : null;
    if (normalizedUsername) {
      const existing = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: user._id }
      });
      if (existing) {
        return res.status(409).json({ message: "Username already exists." });
      }
    }
    user.username = normalizedUsername;
  }
  if (user.role !== "citizen" && !user.username) {
    return res.status(400).json({ message: "Username is required for staff accounts." });
  }
  await user.save();
  res.json({ user: sanitizeUser(user) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.status(204).send();
});
