import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.middleware.js";
import { isUniqueConstraintError } from "../lib/errors.js";
import { toAuthUser, toCurrentUser } from "../lib/users.js";
import {
  loginSchema,
  registerSchema,
  validateBody,
} from "../lib/validation.js";

const router = Router();

// ========================================
// Register
// POST /api/auth/register
// ========================================
router.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.orm.public.User.create({
      username,
      displayName: displayName || null,
      email,
      passwordHash,
    });

    return res.status(201).json(toCurrentUser(user));
  } catch (error) {
    console.error(error);

    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Login
// POST /api/auth/login
// ========================================
router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.orm.public.User
      .where({
        email,
      })
      .first();

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: toAuthUser(user),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Current User
// GET /api/auth/me
// ========================================
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await db.orm.public.User
      .where({
        id: userId,
      })
      .first();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(toCurrentUser(user));
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
