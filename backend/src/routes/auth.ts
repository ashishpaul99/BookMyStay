import express, { Request, Response } from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @route   POST /login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password with 6 or more characters is required').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email, password } = req.body;

    try {
        
      // 1️⃣ Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // 2️⃣ Compare entered password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // 3️⃣ Create JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '1d' }
      );

      // 4️⃣ Store token in cookie
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        maxAge: 86400000, // 1 day
      });

      // 5️⃣ Return user ID
      res.status(200).json({ userId: user._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
);

export default router;
