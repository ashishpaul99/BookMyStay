import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { HotelType } from "../models/hotel";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Store uploaded files in memory (not on disk)
const storage = multer.memoryStorage();

// Initialize multer with storage and file size limit (5MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// api/my-hotels
router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("facilities")
      .isArray({ min: 1 })
      .withMessage("Facilities must be a non-empty array"),
    body("pricePerNight")
      .notEmpty()
      .withMessage("Price per night is required")
      .isNumeric()
      .withMessage("Price per night must be a number"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract image files from multer
      const imageFiles = req.files as Express.Multer.File[];

      // Get other hotel details from the request body
      const newHotel: HotelType = req.body;

      // 1. Upload the images to Cloudinary.
      const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64"); // Convert image buffer to Base64 string
        const dataURI = "data:" + image.mimetype + ";base64," + b64; // Construct Data URI (MIME type + Base64 data)
        const result = await cloudinary.v2.uploader.upload(dataURI); // Upload to Cloudinary and get the response
        return result.url; // Return the secure URL of the uploaded image
      });

      // 2. If the upload is successful, add the URLs to the new hotel object.
      const imageUrls = await Promise.all(uploadPromises);
      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      // 3. Save the new hotel in the database.
      const hotel = new Hotel(newHotel);
      await hotel.save();

      // 4. Return a 201 status response.
      res.status(201).send(hotel);
    } catch (e: any) {
      console.error("Error creating hotel:", e.message || e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;

