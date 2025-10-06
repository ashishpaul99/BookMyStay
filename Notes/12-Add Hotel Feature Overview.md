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
##### 4.1 Creating hotel database
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

#### 5. Building and Validating the New Hotel Object
##### 5.1 Assigning Type to `newHotel`
- Give the **`HotelType`** type to the `newHotel` variable in `my-hotels.ts`.
- This helps with **IntelliSense**, **type checking**, and ensures data consistency.
##### 5.2 Populating Hotel Data
- Before saving the hotel to the database, **populate the rest** of the `newHotel` object.
- `newHotel.imageUrls` → store the **image URLs** returned by Cloudinary in this field.
- Add the **`lastUpdated`** field to the form to track when the hotel was last modified.
##### 5.3 Setting the User ID
- Set `newHotel.userId = req.userId` → this **userId** is obtained from the **request**.
- When the browser sends a request, it includes an **HTTP auth cookie**.
- A **middleware** parses this cookie, validates it, and then adds the `userId` to the request object.
```ts
 newHotel.imageUrls=imageUrls;
 newHotel.lastUpdated=new Date();
 newHotel.userId=req.userId;
```
##### 5.4 Security Consideration
- The reason we take `userId` from the **auth token or cookie** instead of the frontend (UI) is for **security**:
    - If the frontend had a `userId` input field, anyone could manually enter any ID.
    - Using the token ensures the ID belongs to the **currently logged-in user**.
- This approach makes sure that the hotel is created **securely** under the correct user account.
#### 6 Save the new hotel in the database
- Save the hotel object to the hotels collection in the database.
- Ensure that only **logged-in users** can access the `api/my-hotels` endpoint.
```ts
const hotel = new Hotel(newHotel);
await hotel.save();
```
#### 7  Add `verifyToken` middleware to the endpoint
- Add the `verifyToken` middleware **right after the endpoint path** in the router.
- Make sure the **request form data** includes all the required fields for creating a new hotel, as validated by **express-validator**, and this validation should run **after the verifyToken middleware**.
#### 8  Add `my-hotels` endpoint
- Add `my-hotels` endpoint in the `index.ts` file.
**backend/src/index.ts**
```ts
import myHotelRoutes from './routes/my-hotels';
app.use("/api/my-hotels", myHotelRoutes);
```
#### **🔄 Flow** 
- User sends a `POST` request to `/api/my-hotels` with hotel details and image files.
- `verifyToken` middleware checks if the user is authenticated.
- `express-validator` validates all required hotel fields from the request body.
- `multer` processes the uploaded image files and stores them temporarily in memory.
- The server checks for validation errors using `validationResult(req)`.
- Extract image files from `req.files` and hotel details from `req.body`.
- Convert each image buffer to Base64 and upload it to Cloudinary.
- Wait for all uploads to complete using `Promise.all()` and collect image URLs.
- Add `imageUrls`, `lastUpdated`, and `userId` to the `newHotel` object.
- Create a new `Hotel` instance and save it to the database with `await hotel.save()`.
- Respond to the client with status `201` and the saved hotel data.
- If any error occurs, catch it and return a `500` status with an error message.

 **backend/routes/my-hotels.ts**
 ```ts
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
 ```
## 12.4 Create Hotel Form
`05:28:00`
### 1. Create `AddHotel` Component
- Create `AddHotel.tsx` in `frontend/src/pages`
- Create the `AddHotel` component and return the `<ManageHotelForm />`.
- **Reasons for using `<ManageHotelForm />` component:**
	- Makes the form **reusable**, so the same form can be used later for the **Edit Hotel** page.
	- Keeps the **logic and UI** for creating and editing a hotel in **one central component**, reducing code duplication.
```ts
const AddHotel=()=>{
    return(<ManageHotelForm/>)
}
export default AddHotel;
```

### 2. Add `AddHotel` Route
- Open **`frontend/src/App.tsx`**
- Add logic to render **logged-in routes** (like `/add-hotel`) only when the user is authenticated.
**frontend/src/App.tsx**
```ts
import { useAppContext } from "./contexts/AppContext"
const {isLoggedIn}=useAppContext();
{
  isLoggedIn && (
    <>
      <Route path="/add-hotel" element={<Layout><AddHotel/></Layout>}/>
    </>
  )
}
```

### 3. Build `<ManageHotelForm/>` Component
- Create a `forms` folder inside `frontend/src`.
- Inside the `forms` folder, create a `ManageHotelForm` folder.
- Create the `ManageHotelForm.tsx` file inside the `ManageHotelForm` folder.
- The form is quite large and has many different parts and sections. Adding everything into a single component would make it difficult to keep track of everything and hard to navigate.
- Break the form into smaller components, with **one component per section**.
- Sections → Hotel Details, Types, Facilities, Guests, Images.
- This approach will help organize the form into identifiable components, making it easier to maintain and update in the future.
- Set up the form framework we have been using so far: **React Hook Form**.
- Create a type for the form properties.
- It’s similar to the backend hotel type but uses **FileList** for images instead of a string array. Hence, we can’t reuse the backend type.
- Import the `useForm` hook from the React Hook Form package.
- Instead of destructuring (`register`, `watch`, `handleSubmit`, `formState: { errors }`) from `useForm()`, assign everything to a single variable.
- This is because the form is split into smaller components, and we need to use **FormProvider** so that child components can access all React Hook Form methods.
- Wrap the entire form inside the **FormProvider**.

**frontend/src/forms/ManageHotelForm/`ManageHotelForm.tsx`**
```ts
import {FormProvider, useForm} from "react-hook-form"
export type HotelFormData={
    name:string;
    city:string;
    country:string;
    description:string;
    type:string;
    pricePerNight:number;
    startRating:number;
    facilities:string[];
    imageFiles:FileList;
    adultCount:number;
    chldCount:number;
}

const ManageHotelForm=()=>{
    const formMethods=useForm<HotelFormData>();
    return(<FormProvider {...formMethods}>
            <form>
              <DetailsSection/>
            </form>
        </FormProvider>
    )
}
export default ManageHotelForm;
```

##### 💡 Difference between `useForm` and `useFormContext`
1. **`useForm()`** → Initializes the form and provides all React Hook Form methods (like `register`, `handleSubmit`, `watch`, etc.).
	- Used **only once**, usually in the **main form component** (`ManageHotelForm`).
2. **`useFormContext()`** → Allows **child components** to access the form methods from the context provided by `FormProvider`. 
	- Used in **nested components** (like `HotelDetailsSection`).
Notes:
- **`register`** → Connects input fields to React Hook Form for tracking and validation.
- **`watch`** → Watches and returns the current value(s) of specified form fields.
- **`handleSubmit`** → Handles form submission and runs validation before calling your submit function.
- **`formState: { errors }`** → Contains validation error messages for each field.
#### 1. Building HotelDetailsSection Component
- Create `DetailsSection.tsx` inside **frontend/src/forms/ManageHotelForm**.
- Create a `HotelDetailsSection` component.
- Import `useFormContext()` from `"react-hook-form"`.
- The form context that was created using `useForm()` inside `ManageHotelForm` can be accessed in any child component (like `HotelDetailsSection`) through `useFormContext()`
 **frontend/src/forms/ManageHotelForm/DetailsSection.tsx
 ```ts
import { useFormContext } from "react-hook-form";
import type { HotelFormData } from "./ManageHotelForm";

const HotelDetailsSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4"> {/* Fixed typo: felx → flex */}
      <h1 className="text-3xl font-bold mb-3">Add Hotel</h1>

      {/* Hotel Name */}
      <div>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Name
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("name", { required: "This field is required" })}
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </label>
      </div>

      {/* City and Country */}
      <div className="flex flex-col md:flex-row gap-5">
        <label className="text-gray-700 text-sm font-bold flex-1">
          City
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal" // Fixed typo: font-nomal → font-normal
            {...register("city", { required: "This field is required" })}
          />
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>

        <label className="text-gray-700 text-sm font-bold flex-1">
          Country
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("country", { required: "This field is required" })}
          />
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Description
          <textarea
            rows={5}
            className="border rounded w-full p-2 resize-none"
            {...register("description", { required: "This field is required" })}
          ></textarea>
          {errors.description && (
            <span className="text-red-500">{errors.description.message}</span>
          )}
        </label>

        {/* Price Per Night */}
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Price Per Night
          <input
            type="number"
            min={1}
            className="border rounded w-[50%] my-1 py-1 px-2 font-normal block"
            {...register("pricePerNight", { required: "This field is required" })}
          />
          {errors.pricePerNight && (
            <span className="text-red-500">{errors.pricePerNight.message}</span>
          )}
        </label>

        {/* Star Rating */}
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Star Rating
          <select
            className="border rounded w-[50%] my-1 py-1 px-2 font-normal block"
            {...register("starRating", { required: "This field is required" })} // Fixed typo: startRating → starRating
          >
            <option value="" className="text-sm font-bold">
              Select a Rating
            </option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {errors.starRating && (
            <span className="text-red-500">{errors.starRating.message}</span>
          )}
        </label>
      </div>
    </div>
  );
};
export default HotelDetailsSection;
 ```

![](Images/Pasted%20image%2020251006215333.png)
#### 2. Building the Hotel Type Section Component
##### 2.1 Creating a Config File for Hotel Types
- Hotel **types** are represented as selectable chips in the form.
- These types are provided by hotel booking websites.
- A user who signs up only needs to select a type when creating a hotel.
- For such static options, it’s best to store them in a **configuration file**.
- Create a file named `hotel-options-config.ts` inside `frontend/src/config`.
- To **edit hotel types**, simply update the `hotel-options-config.ts` file.
**frontend/src/config/hotel-options-config.ts**`
```ts
export const hotelTypes=[
  "Budget",
  "Boutique",
  "Luxury",
  "Ski Resort",
  "Business",
  "Family",
  "Romantic",
  "Hiking Resort",
  "Cabin",
  "Beach Resort",
  "Golf Resort",
  "Motel",
  "All Inclusive",
  "Pet Friendly",
  "Self Catering",
]
```
##### 2.2 Building the Hotel Type Section Component
- Create a `TypeSection.tsx` file in **frontend/src/forms/ManageHotelForm** folder.
- Hide the radio buttons using `className="hidden"` and style the labels to indicate when an option is selected.
- Style the labels (chips) for better UX.
- Use `useFormContext()` to access form methods.
- De-structure the `watch` function from `useFormContext()`.
- Use `watch("type")` to get the currently selected type.
- Store the selected type value in a variable (e.g., `typeWatch`).
- When the type form field changes, `typeWatch` will automatically update with the new value.

**Flow of `TypeSection` Component**
- Import `useFormContext`, `hotelTypes`, and `HotelFormData`.
- Access form methods using `useFormContext`: `register`, `watch`, `errors`.
- Use `watch("type")` to track the currently selected type.
- Render a heading: **Type**.
- Map over `hotelTypes` to render radio button chips.
	- Apply conditional styling if the chip is selected.
	- Bind each input to `register("type", { required })`.
	- Hide the actual radio input (`className="hidden"`) and display styled span.
- Add `key` prop to each chip for React list rendering.
- Display error message if no type is selected using `errors.type`.
- Export the component as `TypeSection`.

```ts
import { useFormContext } from "react-hook-form";
import { hotelTypes } from "../../config/hotel-options-config";
import type { HotelFormData } from "../ManageHotelForm/ManageHotelForm";

const TypeSection = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const typeWatch = watch("type"); // Watch selected type for styling

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Type</h2>

      <div className="grid grid-cols-5 gap-2">
        {hotelTypes.map((type) => (
          <label
            key={type} // Added key for React list
            className={
              typeWatch === type
                ? "cursor-pointer bg-blue-300 text-sm rounded-full px-4 py-2 font-semibold"
                : "cursor-pointer bg-gray-300 text-sm rounded-full px-4 py-2 font-semibold"
            }
          >
            <input
              type="radio"
              value={type}
              {...register("type", { required: "This field is required" })}
              className="hidden"
            />
            <span>{type}</span>
          </label>
        ))}
      </div>

      {/* Display error message if type is not selected */}
      {errors.type && (
        <span className="text-red-500 text-sm font-bold">
          {errors.type.message}
        </span>
      )}
    </div>
  );
};

export default TypeSection;
```
![](Images/Pasted%20image%2020251006225511.png)
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
