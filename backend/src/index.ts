import express, {Request,Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import userRoute from './routes/users';
import authRoute from './routes/auth';
import cookieParser from "cookie-parser"
const port=7000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

const app=express();
app.use(cookieParser());
app.use(express.json()); //convert body in API to json
app.use(express.urlencoded({extended:true}));



// CORS configuration - Apply CORS to all routes
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true
}));


app.use("/api/auth",authRoute)
app.use("/api/users",userRoute);


app.listen(port,()=>{
   console.log(`http://localhost:7000/`)
   console.log(`server is running on port ${port}`)
})