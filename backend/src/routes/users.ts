import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator"; 
import jwt from "jsonwebtoken";
import User from "../models/user";

const router = express.Router(); // Create router instance

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    // ✅ Validation middleware
    check("firstName", "First Name is required").isString().notEmpty(),
    check("lastName", "Last Name is required").isString().notEmpty(),
    check("email", "Valid email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    // ✅ Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Send back all validation errors in standard format
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // ✅ 1. Check if user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // ✅ 2. Create new user from request body
      user = new User(req.body);

      // ✅ 3. Save user to database
      await user.save();

      // ✅ 4. Create JWT token (store userId inside)
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string, // Secret from .env
        { expiresIn: "1d" } // Token valid for 1 day
      );

      // ✅ 5. Store token in an HTTP-only cookie
      res.cookie("auth_token", token, {
        httpOnly: true, // Prevent client-side JS access
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        maxAge: 86_400_000, // 1 day in ms
      });

      // ✅ 6. Send success response
      return res.status(201).json({ message: "User signed up successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
