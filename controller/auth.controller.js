import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import { ErrorHandler } from "../error.js";
import prisma from "../config/db.js";
import { sendVerificationEmail } from "../services/sendEmail.js";

export const req_email_verification = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new ErrorHandler(400, "Email is required");
    return next(err);
  }
  try {
    const hash = crypto.randomBytes(32).toString("hex");
    await redisClient.setEx(`email_verification_${email}`, 3600, hash);
    await sendVerificationEmail(email, hash);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};
export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    const err = new ErrorHandler(400, "Token is required");
    return next(err);
  }
  try {
    const userData = await redisClient.get(`verify:${token}`);
    if (!userData) {
      const err = new ErrorHandler(400, "Invalid or expired verification link");
      return next(err);
    }

    const { username, email, password } = JSON.parse(userData);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      await redisClient.del(`verify:${token}`);
      const err = new ErrorHandler(
        400,
        "User with this email or username already exists"
      );
      return next(err);
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    await redisClient.del(`verify:${token}`);

    res.status(200).json({
      message: "Email verified successfully! You can now login.",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      const err = new ErrorHandler(400, "All fields are required");
      return next(err);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const err = new ErrorHandler(
        400,
        "User with this email or username already exists"
      );
      return next(err);
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await redisClient.setEx(
      `verify:${verificationToken}`,
      86400,
      JSON.stringify({ username, email, password })
    );

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message:
        "Registration initiated! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};
export const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      const err = new ErrorHandler(
        400,
        "Email/Username and password are required"
      );
      return next(err);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      const err = new ErrorHandler(404, "Account not found");
      return next(err);
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new ErrorHandler(400, "Invalid credentials");
      return next(err);
    }
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "48h" },
      (err, token) => {
        if (err) {
          const error = new ErrorHandler(500, "Error while generating token");
          return next(error);
        }
        res.status(200).json({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};
