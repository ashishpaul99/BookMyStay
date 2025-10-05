# 12-Add Hotel Feature Overview
 ` 04:45:00`
 - Add **Manage Hotel** form.
- This feature makes it easier to build out the **search functionality** later.
- We have a hotel form in the frontend that captures all the necessary details from the user to create a new hotel entry.
- Once the user completes the form, we’ll make a **POST** request to a new API endpoint:  
    **`POST /api/my-hotels`** — handled by the Node.js backend server.
- When the backend receives this request, it takes the images uploaded by the user and sends them to a third-party service called **Cloudinary**.
- **Cloudinary** → one of the top services used to host images.
	- Using a third-party service like Cloudinary saves us time and server space since we don’t need to manage image storage ourselves.
	- It’s free (with a generous plan) and provides built-in image optimization features.
- Once the images are uploaded, **Cloudinary** returns **URLs (as strings)** pointing to the hosted images.
- The backend then merges these image URLs with the rest of the hotel data received in the request.
- Finally, the complete hotel data (including image URLs) is saved to the **MongoDB database**.
 ![](Images/Pasted%20image%2020251004140007.png)

## 12.1 Building Manage Hotel Form
- Create a new page called **Add Hotel**.
- The form should include the following fields:
	- **Hotel Name**
	- **City**
	- **Country**
	- **Description**
	- **Price per Night**
	- **Star Rating** → values from **1 to 5**'
	- **Type** → Budget, Boutique, Luxury, Resort, Business, Family, Romantic.
	- -**Facilities** → Free Wi-Fi, Parking, Airport Shuttle, Family Rooms, Non-Smoking Rooms, Outdoor Pool, Spa, Fitness Center.
	- **Guests** → number of guests a hotel room can accommodate
		- **Adults**
		- **Children**
		- **Images** → select up to **6 images**
			- **Choose Files** → opens file explorer to upload images.
- **Save Button** → on click, redirects to the **My Hotels** page.

	![](Images/Pasted%20image%2020251004142047.png)
	![](Images/Pasted%20image%2020251004142111.png)
	![](Images/Pasted%20image%2020251004142141.png)

## 12.2  Cloudinary Setup
### 1. Sign Up and Install SDK
- Go to [https://cloudinary.com/](https://cloudinary.com/) and **sign up for free**.
- Add the **Cloudinary SDK** to the backend codebase.
- In the backend folder, install the Cloudinary SDK : `npm i cloudinary`
- Go to backend and Install cloudinary SDK : 
- **SDK (Software Development Kit)** → provides developer-friendly methods to access Cloudinary’ s APIs and perform operations (like uploading images) without writing low-level code.
- Initialize the connection to **Cloudinary** from the backend Node.js server.
### 2. Configure Environment Variables
- Use `#` to write comments in the `.env` file.
- Open the `.env` file inside the backend folder.
- Three environment variables are required to connect to Cloudinary:
	- `CLOUDINARY_CLOUD_NAME` → Cloud name from Cloudinary dashboard
	- `CLOUDINARY_API_KEY` → Cloudinary API key
	- `CLOUDINARY_API_SECRET` → Cloudinary API secret
- Steps to get these:
	- **Cloud Name:** Settings → Product Environment → copy → assign to `CLOUDINARY_CLOUD_NAME`
	- **API Key:** Settings → Access Keys → Generate New Access Key → assign to `CLOUDINARY_API_KEY`
	- **API Secret:** Click on API Secret → copy → assign to `CLOUDINARY_API_SECRET`
- **Note:** API Secret is like a password; API Key is like a username — keep secrets safe and never expose them publicly.
### 3. Initialize Cloudinary in Backend
- Open `index.ts` in the backend folder.
- Initialize the Cloudinary SDK using the environment variables.
- This file runs when the server starts, so it’s ideal to initialize services (Cloudinary, database, etc.) here.
- Any errors during initialization will be caught early, helping you handle issues before the server fully starts.
- Run the backend server using: `npm run dev
- If there is any error in the Cloudinary setup (or other initializations), it will appear in the console.
- Successful startup means Cloudinary and other services are correctly initialized.
- `import { v2 as cloudinary } from 'cloudinary'` → It imports **Cloudinary’s v2 SDK** and names it `cloudinary`, so you can use it in your code to **configure and upload images** easily.
`
**backend/src/Index.ts**
```ts
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary connection with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

## 12.3 Create Hotel API
- Create a backend API route on the Node.js server that allows users to **create a hotel**.
- In the `routes` folder, create a new file named **`my-hotels.ts`**.
- This file will contain a set of API endpoints that let users **create, update, and view** their own hotels.
- Later in the course, we’ll add another set of endpoints for **public users** — allowing them to **search and view hotels** on the website.
- This structure helps **organize the code** by separating:
	- Endpoints for **managing a user’s own hotels**, and
	- Endpoints for **searching and viewing all hotels** on the platform.
- Endpoint that the frontend calls when the user submits the **"Add Hotel"** form.  
- **backend/routes/my-hotels**
```ts
import express, {Request,Response} from "express";
const router=express.Router();

// api/my-hotels
router.post("/", async (req:Request,res:Response)=>{
    res.send("Add Hotels")
})
export default router;
```
### 1. Multer Package
- When working with forms that include images, we typically send the data as a multipart form object.
- Until now, we’ve been sending requests in JSON format, but forms with images use **multipart form data**.
- To handle image uploads, we use the **multer** package.
-  **Multer package** → extracts the binary image data from the form in the request and provides it as an object, making it easier to handle in the backend.
- Install the **multer** package and its TypeScript types.
```bash
npm i multer
npm i -D @types/multer
```
#### 2. Configuring 
- Go to `my-hotels.ts` file 
- write few lines of config to multer to tell it what to expect.
- The **storage** setting tells Multer to keep uploaded files (images) **in memory** instead of saving them to disk, since we’re forwarding them directly to Cloudinary.
- We upload images **directly to Cloudinary** as soon as we receive them, so the backend doesn’t store them.
- This improves **performance** and saves **server storage**, since images are handled externally and memory usage is minimal.
- Define **file limits** and initialize **Multer**.
- Set the **maximum file size** to **5MB** (in bytes).
- After initializing Multer, add the **upload** variable as middleware.
- Define the name of the form field that holds images → `imageFiles`.
- The frontend will send an `imageFiles` array containing up to **6 images**.
- `upload.array("imageFiles", 6)` middleware takes two parameters:
	- Form field name → `imageFiles`
	- Maximum number of files → `6`
 **backend/routes/my-hotels**
```ts
import multer from "multer";

// Store uploaded files in memory (not on disk)
const storage = multer.memoryStorage();

// Initialize multer with storage and file size limit (5MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
```
#### 3. Upload the images to Cloudinary.
1. **Encoding Images**
	- Each uploaded image is first **converted to a Base64 string**.
	- We use `Buffer.from(image.buffer).toString("base64")` to achieve this.
	- This conversion allows Cloudinary to process the image data.
2. **Creating Data URI**
	- The Base64 string alone isn’t enough — Cloudinary also needs to know the **MIME type** (like `image/png` or `image/jpeg`).
	- We combine both into a **Data URI** format: `data:<mimetype>;base64,<base64string>
	- This Data URI contains all image information needed for upload.
3. **Uploading to Cloudinary**
	- Each image is uploaded using Cloudinary’s SDK: `cloudinary.v2.uploader.upload(dataURI)
	- The response includes details like image URL, public ID, format, etc.
	- We extract and use the **`secure_url`**, which is the hosted image link.
4. **Handling Multiple Images**
	- Since uploads are **asynchronous**, we create an **array of promises** using `.map()`
	- This allows multiple uploads to happen **in parallel**.
	- Using `Promise.all()`, we wait until **all uploads complete** before moving forward.
5. **Storing Uploaded URLs**
	- Once uploads are done, we get an **array of URLs** (`imageUrls`).
	- These URLs can then be saved in the database along with the hotel data.
 **backend/routes/my-hotels**
```ts
// Extract image files from multer
const imageFiles = req.files as Express.Multer.File[];

// Get other hotel details from the request body
const newHotel = req.body;

// Upload images to Cloudinary
const uploadPromises = imageFiles.map(async (image) => {
  const b64 = Buffer.from(image.buffer).toString("base64"); // Convert buffer to Base64
  const dataURI = `data:${image.mimetype};base64,${b64}`;   // Create Data URI (MIME + Base64)

  const res = await cloudinary.v2.uploader.upload(dataURI);  // Upload to Cloudinary
  return res.secure_url;                                     // Return HTTPS image URL
});

// Wait for all uploads to finish
const imageUrls = await Promise.all(uploadPromises);

```

#### 4. If the upload is successful, add the URLs to the new hotel object
- Add an **error handler** in the `catch` block.
- Before saving the hotel to the database, a **hotel model** should be created.
##### 1. Creating hotel database
- Create a new file named **`hotel.ts`** inside `backend/src/models`.
- Define a **TypeScript type** — this helps with **IntelliSense** and type safety when creating new hotels.
- Once the **hotel schema** is defined, you can start **saving hotels to the database**.
**backend/src/models/hotels.ts**
```ts
import mongoose from "mongoose";

// Hotel type definition
export type HotelType = {
  _id: string;
  userId: string;          // ID of user who created the hotel
  name: string;            // Hotel name
  city: string;            // City location
  country: string;         // Country location
  description: string;     // Hotel description
  type: string;            // Hotel type (e.g., resort, villa)
  adultCount: number;      // Max number of adults
  childCount: number;      // Max number of children
  facilities: string[];    // Hotel amenities
  pricePerNight: number;   // Cost per night
  starRating: number;      // Rating between 1–5
  imageUrls: string[];     // Uploaded image URLs
  lastUpdated: Date;       // Last updated timestamp
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
```

#### 5. Populating and Securing the New Hotel Object
##### 1. Assigning Type to `newHotel`
- Give the **`HotelType`** type to the `newHotel` variable in `my-hotels.ts`.
- This helps with **IntelliSense**, **type checking**, and ensures data consistency.
##### 2. Populating Hotel Data
- Before saving the hotel to the database, **populate the rest** of the `newHotel` object.
- `newHotel.imageUrls` → store the **image URLs** returned by Cloudinary in this field.
- Add the **`lastUpdated`** field to the form to track when the hotel was last modified.
##### 3. Setting the User ID
- Set `newHotel.userId = req.userId` → this **userId** is obtained from the **request**.
- When the browser sends a request, it includes an **HTTP auth cookie**.
- A **middleware** parses this cookie, validates it, and then adds the `userId` to the request object.
```ts
 newHotel.imageUrls=imageUrls;
 newHotel.lastUpdated=new Date();
 newHotel.userId=req.userId;
```
##### 4. Security Consideration
- The reason we take `userId` from the **auth token or cookie** instead of the frontend (UI) is for **security**:
    - If the frontend had a `userId` input field, anyone could manually enter any ID.
    - Using the token ensures the ID belongs to the **currently logged-in user**.
- This approach makes sure that the hotel is created **securely** under the correct user account.

 **backend/routes/my-hotels.ts**
 ```ts
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

            //Upload the images to Cloudinary.
            const uploadPromises=imageFiles.map(async(image)=>{
            
            // Convert image  buffer to Base64 string 
            const b64=Buffer.from(image.buffer).toString("base64"); 

			// Construct Data URI (MIME type + Base64 data)
            let dataURI="data:"+image.mimetype+";base64,"+b64;  
			
			// Upload to Cloudinary and get the response
            const res=await cloudinary.v2.uploader.upload(dataURI);
            
            return res.url;  // Return the secure URL of the uploaded image
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
 ```

# Quick Revision
### 1. Manage Hotel Form
- Add **Manage Hotel** form.
- Helps in building search functionality later.
- Frontend form collects all required hotel details from user.
- On form submit → **POST /api/my-hotels** → handled by backend.
- Backend takes uploaded images → uploads to **Cloudinary**.
- **Cloudinary** hosts images (saves time & storage, free plan, optimized delivery).
- Cloudinary returns **image URLs**.
- Backend merges image URLs + other hotel data.
- Saves final hotel data to **MongoDB**.
