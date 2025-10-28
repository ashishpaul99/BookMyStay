import express,{Request,Response} from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { HotelType } from "../shared/types";
import Hotel from "../models/hotel"
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
const router=express.Router();

// Store uploaded files in memory (not on disk)
const storage=multer.memoryStorage();

// Initialize multer with storage and file size limit (5MB)
const upload=multer({
    storage:storage,
    limits:{
        fileSize:5*1024*1024 //5MB
    },
})

// api/my-hotels
router.post("/", verifyToken,  upload.array("imageFiles",6), 
 [
  body("name").notEmpty().withMessage("Name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("type").notEmpty().withMessage("Hotel type is required"),
  body("pricePerNight")
    .isNumeric()
    .withMessage("Price per night is required and must be a number"),
  body("facilities")
    .isArray({ min: 1 })
    .withMessage("Facilities must be a non-empty array"),
] ,async (req:Request,res:Response)=>{
    try{
        const imageFiles=req.files as Express.Multer.File[];
        const newHotel:HotelType=req.body;

        console.log("Files:", imageFiles);
        console.log("Body:", newHotel);

        // 1. Upload the images to Cloudinary.
        // we upload one image at a time in cloudinary
        const uploadPromises=imageFiles.map(async (image)=>{
            const b64=Buffer.from(image.buffer).toString("base64");// Convert image buffer to Base64 string
            let dataURI="data:"+image.mimetype+";base64,"+b64; //Construct Data URI (MIME type + Base64 data)
            const res=await cloudinary.uploader.upload(dataURI);  // Upload to Cloudinary and get the response
            return res.url; // Return the secure URL of the uploaded image
        });

        // 2. If the upload is successful, add the URLs to the new hotel object.
        const imageUrls=await Promise.all(uploadPromises);
        newHotel.imageUrls=imageUrls;
        newHotel.lastUpdated=new Date();
        newHotel.userId=req.userId;

        // 3. Save the new hotel in the database.
        const hotel=new Hotel(newHotel)
        await hotel.save();

        // 4. Return a 201 status response.
        res.status(201).send(hotel);

    }catch(error){
        console.log("Error creating hotel",error);
        res.status(500).send({message:"Something went wrong",error});
    }
})

router.get("/",verifyToken,async (req:Request,res:Response)=>{
    try{
        const hotels=await Hotel.find({userId:req.userId});
        res.json(hotels);

    }catch(error){
        res.status(500).json({message:"Error fetching hotels"});
    }  
})
export default router;



