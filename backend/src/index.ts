import express, {Request,Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import userRoute from './routes/users';
import authRoute from './routes/auth'

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

const app=express();
const port=7000;
app.use(express.json()); //convert body in API to json
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use("/api/auth",authRoute)
app.use("/api/users",userRoute);


app.listen(port,()=>{
   console.log(`http://localhost:7000/`)
   console.log(`server is running on port ${port}`)
})