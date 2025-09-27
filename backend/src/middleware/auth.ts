import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from cookies (key: auth_token)
  const token = req.cookies['auth_token']

  // If no token is present, block the request
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

    // Extract userId from decoded payload and attach it to req object
    req.userId = (decoded as JwtPayload).userId;

    // Pass control to the next middleware/controller
    next();
  } catch (error) {
    // If token verification fails, return 401
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyToken;
