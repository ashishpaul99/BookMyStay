import express,{Request,Response} from "express";
import Hotel from "../models/hotel";
import { HotelSearchResponse } from "../shared/types";
const router=express.Router();

// GET /api/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    // Pagination setup
    const pageSize = 5;
    const pageNumber = parseInt(req.query.page?.toString() || "1");
    const skip = (pageNumber - 1) * pageSize;

    // Fetch paginated hotels
    const hotels = await Hotel.find().skip(skip).limit(pageSize);

    // Get total number of hotels
    const total = await Hotel.countDocuments();

    // Build response
    const response:HotelSearchResponse = {
      data: hotels,
      pagination: {
        total, // total number of hotels
        page: pageNumber, // current page
        pages: Math.ceil(total / pageSize), // total number of pages
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;

// total = 23
// pageSize = 5
// total / pageSize = 23 / 5 = 4.6
// Math.ceil(4.6) = 5
