import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken, sanitizeUser } from "../utils/token.js";
import Complaint from "../models/Complaint.js";

const normalizeUsername = (value) => value.trim().toLowerCase();

export const registerCitizen = asyncHandler(async (req, res) => {
  const { name, cnic, email, password } = req.body;
  if (!name || !cnic || !password) {
    return res.status(400).json({ message: "Name, CNIC, and password are required." });
  }
  const checks = [{ cnic: cnic.trim() }];
  if (email) {
    checks.push({ email: email.trim().toLowerCase() });
  }
  const existing = await User.findOne({ $or: checks });
  if (existing) {
    return res.status(409).json({ message: "CNIC or email already exists." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    cnic: cnic.trim(),
    email: email ? email.trim().toLowerCase() : undefined,
    passwordHash,
    role: "citizen",
    isActive: true
  });
  const token = createToken(user);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

export const loginCitizen = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required." });
  }
  const user = await User.findOne({
    role: "citizen",
    $or: [{ cnic: identifier.trim() }, { email: identifier.trim().toLowerCase() }]
  }).select("+passwordHash");
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const token = createToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

export const loginStaff = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  const user = await User.findOne({
    username: normalizeUsername(username),
    role: { $in: ["admin", "department"] }
  }).select("+passwordHash");
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const token = createToken(user);
  // Auto-resolve complaints that have been waiting for citizen response for over 30 days
  try {
    if (user.role === "admin") {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await Complaint.updateMany(
        { status: "citizen_verifying", departmentResolvedAt: { $lte: cutoff } },
        { $set: { status: "accepted", citizenAcceptedAt: new Date() } }
      );
    }
  } catch (e) {
    // Log but don't block login
    // eslint-disable-next-line no-console
    console.error("Auto-resolve error:", e.message);
  }

  return res.json({ token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});
