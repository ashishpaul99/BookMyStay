import express, {Request,Response} from "express";
import multer from "multer";
import cloudinary from "cloudinary"
import {HotelType} from "../models/hotel";
const router=express.Router();

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
    upload.array("imageFiles",6),
    async (req:Request,res:Response)=>{
        try{
            //Extract image files from multer
            const imageFiles=req.files as Express.Multer.File[];

            //Get other hotel details from the request body
            const newHotel:HotelType=req.body;
          

            // 1. Upload the images to Cloudinary.
            const uploadPromises=imageFiles.map(async(image)=>{
                const b64=Buffer.from(image.buffer).toString("base64"); // Convert image buffer to Base64 string
                let dataURI="data:"+image.mimetype+";base64,"+b64;  // Construct Data URI (MIME type + Base64 data)
                const res=await cloudinary.v2.uploader.upload(dataURI);// Upload to Cloudinary and get the response
                return res.url;  // Return the secure URL of the uploaded image
            })

            // Wait for all image uploads to finish
            const imageUrls=await Promise.all(uploadPromises);
            newHotel.imageUrls=imageUrls;
            newHotel.lastUpdated=new Date();
            newHotel.userId=req.userId;

            
            // 2. If the upload is successful, add the URLs to the new hotel object.

            // 3. Save the new hotel in the database.

            // 4. Return a 201 status response.


        }catch(e){
          console.log("Error creating hotel:",e);
          res.status(500).json({message:"Something went wrong"})
        }
    }
)

export default router;

