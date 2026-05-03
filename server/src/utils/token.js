import jwt from "jsonwebtoken";

export function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || null,
    cnic: user.cnic,
    email: user.email || null,
    role: user.role,
    departmentId: user.departmentId || null,
    isActive: user.isActive
  };
}
