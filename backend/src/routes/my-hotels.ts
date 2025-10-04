import express, {Request,Response} from "express";
import multer from "multer";
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
            

        }catch(e){

        }
    }
)

export default router;

