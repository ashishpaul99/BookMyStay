import express, {Request,Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import userRoute from './routes/users';
import authRoute from './routes/auth';
import cookieParser from "cookie-parser"
import path from "path"
const port=7000;
import { v2 as cloudinary } from 'cloudinary';
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";

// Initialize Cloudinary connection with credentials from environment variables
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true,
})

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database:", process.env.MONGODB_CONNECTION_STRING))
  .catch((err: any) => console.error("Database connection error:", err));

const app=express();
app.use(cookieParser());
app.use(express.json()); //convert body in API to json
app.use(express.urlencoded({extended:true}));

// CORS configuration - Apply CORS to all routes
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true
}));

app.use(express.static(path.join(__dirname,"../../frontend/dist")))
app.use("/api/auth",authRoute);
app.use("/api/users",userRoute);
app.use("/api/my-hotels", myHotelRoutes);// Owner routes: create/edit/manage your hotels
app.use("/api/hotels", hotelRoutes); // Public routes for website visitors to search and view hotels      


app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});


app.listen(port,()=>{
   console.log(`http://localhost:7000/`)
   console.log(`server is running on port ${port}`)
})