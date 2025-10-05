import mongoose from "mongoose";

// Hotel type definition
export type HotelType = {
  _id: string;
  userId: string;          // ID of user who created the hotel
  name: string;            // Hotel name
  city: string;            // City location
  country: string;         // Country location
  description: string;     // Hotel description
  type: string;            // Hotel type (e.g., resort, villa)
  adultCount: number;      // Max number of adults
  childCount: number;      // Max number of children
  facilities: string[];    // Hotel amenities
  pricePerNight: number;   // Cost per night
  starRating: number;      // Rating between 1–5
  imageUrls: string[];     // Uploaded image URLs
  lastUpdated: Date;       // Last updated timestamp
};

// Hotel schema
const hotelSchema = new mongoose.Schema<HotelType>({
  userId: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true }, // fixed spelling
  type: { type: String, required: true },
  adultCount: { type: Number, required: true },
  childCount: { type: Number, required: true },
  facilities: [{ type: String, required: true }],
  pricePerNight: { type: Number, required: true },
  starRating: { type: Number, required: true, min: 1, max: 5 },
  imageUrls: [{ type: String, required: true }],
  lastUpdated: { type: Date, required: true } 
});

// Create hotel model
const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);
export default Hotel;
