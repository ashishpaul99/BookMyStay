# 13-View My Hotels
- **My Hotels** → Opens the _“My Hotels”_ page, where the user can view all the hotels they’ve added.
- **View Details** → Navigates to the _“Edit Hotel”_ or _“Manage Hotel”_ page, allowing the user to update or manage the selected hotel.
  ![](Images/Pasted%20image%2020251028194249.png)
  ![](Images/Pasted%20image%2020251028194421.png)
  ![](Images/Pasted%20image%2020251028194450.png)
## 1. Add view my hotel route in backend
- Creating backend route 
- **`backend/src/routes`**
```ts
router.get("/",verifyToken,async (req:Request,res:Response)=>{
    try{
        const hotels=await Hotel.find({userId:req.userId});
        res.json(hotels);
    }catch(error){
        res.status(500).json({message:"Error fetching hotels"});
    }  
})
export default router;
```

## 2. Add the `fetchMyHotels` Function to `api-client.ts`
- The `fetchMyHotels` function’s **return type** is `HotelType[]`.
- `HotelType` is a **TypeScript type** that represents the structure of a hotel document.
- This type is **declared in the backend** within the MongoDB hotel schema file located at:  
    `models/hotel.ts`.
- Therefore, the function returns an **array of hotel objects** that follow the `HotelType` structure.
- `frontend/src/api-client.ts`
```tsx
import type { RegisterFormData } from "./pages/Register";
import type {SignInFormData} from "./pages/SignIn"
import type {HotelType} from "../../backend/src/shared/types"

// Import environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "" ;
export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  // We will get an array of hotel details
  return response.json();
};
```

## 3. MyHotels Page in `Pages`
- Create the `MyHotels.tsx` page inside the `pages` folder:  `frontend/src/pages/MyHotels.tsx`
- Add React Icons for displaying hotel details.
- Navigate to the frontend folder and install the React Icons package: → `npm i react-icons`
```tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiMoney, BiHotel, BiStar } from "react-icons/bi";

const MyHotels = () => {
  const { data: hotelData, isError, error } = useQuery({
    queryKey: ["fetchMyHotels"],
    queryFn: apiClient.fetchMyHotels,
  });

  if (isError) {
    console.error("Error fetching hotels:", error);
  }

  if (!hotelData || hotelData.length === 0) {
    return <span>No Hotels found</span>;
  }

  return (
    <div className="space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl text-black font-bold">My Hotels</h1>
        <Link
          className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
          to="/add-hotel"
        >
          Add Hotel
        </Link>
      </span>
      <div className="grid grid-cols-1 gap-5">
        {hotelData.map((hotel) => (
          <div
            key={hotel._id}
            className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5"
          >
            <h2 className="text-2xl font-bold">{hotel.name}</h2>
            <div className="whitespace-pre-line">{hotel.description}</div>
            <div className="grid grid-cols-5 gap-2">
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsMap className="mr-1" />
                {hotel.city}, {hotel.country}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsBuilding className="mr-1" />
                {hotel.type}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiMoney className="mr-1" />
                ₹ {hotel.pricePerNight} Per Night
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiHotel className="mr-1" />
                {hotel.adultCount} adults, {hotel.childCount} children
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiStar className="mr-1" />
                {hotel.starRating} Star Rating
              </div>
            </div>
            <span className="flex justify-end">
              <Link
                to={`/edit-hotel/${hotel._id}`}
                className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
              >
                View Details
              </Link>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;
```

## 4. Add the `MyHotels` Route in `App.tsx`
- frontend/src/App.tsx
```tsx
import AddHotel from "./pages/AddHotel"
import MyHotels from "./pages/MyHotels"
{isLoggedIn && (
  <>
    <Route path="/add-hotel" element={<Layout> <AddHotel /> </Layout>}/>
    <Route path="/myhotels" element={<Layout> <MyHotels /> </Layout>}/>
  </>
)}
```

## 5. View My Hotel Test
- Testing view my hotel feature.
- Add test hotel document in e2e-test.
```json
{
  "_id": { "$oid": "68ffa3b2ec8646d9f3e0667c" },
  "userId": "68dae45d75d56ac5ff67b0a7",
  "name": "Test Hotel",
  "city": "Test City",
  "country": "Test Country",
  "description": "This is a description for the Test Hotel",
  "type": "Budget",
  "adultCount": { "$numberInt": "2" },
  "childCount": { "$numberInt": "4" },
  "facilities": ["Free WiFi", "Parking"],
  "pricePerNight": { "$numberInt": "100" },
  "starRating": { "$numberInt": "3" },
  "imageUrls": [
"http://res.cloudinary.com/de23dtkaz/image/upload/v1761584049/jobrdexgpuvnq5jbafg8.jpg",
"http://res.cloudinary.com/de23dtkaz/image/upload/v1761584048/mvkqcv5vck7h4hipmjpa.jpg"
  ],
  "lastUpdated": { "$date": { "$numberLong": "1761584049981" } },
  "__v": { "$numberInt": "0" }
}
```

- Start backend → `npm run e2e` 
- Start frontend → `npm run dev`
- `e2e-tests/tests/manage-hotels.spec.ts`
```tsx
import { test, expect } from "@playwright/test";
import * as path from "path";

const UI_URL = "http://localhost:5173/";

test("should display hotels correctly", async ({ page }) => {
await page.goto(`${UI_URL}my-hotels`);

// Check page title and Add Hotel link
await expect(page.getByRole("heading", { name: "My Hotels" })).toBeVisible();
await expect(page.getByRole("link", { name: "Add Hotel" })).toBeVisible();

// Check hotel details (sample seeded data)
await expect(page.getByRole("heading",{name:"Test Hotel"})).toBeVisible();
await expect(page.getByText("This is a description for the Test Hotel")).toBeVisible();
await expect(page.getByText("Test City, Test Country")).toBeVisible();
await expect(page.getByText("Budget")).toBeVisible();
await expect(page.getByText("₹ 100 Per Night")).toBeVisible();
await expect(page.getByText("2 adults, 4 children")).toBeVisible();
await expect(page.getByText("3 Star Rating")).toBeVisible();

// Check "View Details" button
await expect(page.getByRole("link", { name: "View Details" })).toBeVisible();

});
```

## Moving Shared Types Before Deployment
- Before deployment, we need to make a few adjustments to organize our code properly:
- The **`HotelType`** should **not** be kept inside the `models` folder, since it’s now shared between the frontend and backend — having it there can be confusing.
- It’s best to move it into a **shared folder**.
- Create a new folder named **`shared`** inside `backend/src`.
- It’s perfectly fine to keep the shared folder inside the backend directory because, during deployment, both frontend and backend code are bundled together.
- Inside the `shared` folder, create a **`types.ts`** file.
- The `shared` folder is meant for **code that is reused between frontend and backend**, such as type definitions or utility functions.
- The `types.ts` file will store all **shared TypeScript types** like `HotelType`.
- Change imports in file `api-client.ts`, `myHotels.ts` and `hotel.ts`

```ts
export type HotelType={
  _id:string;
  userId:string;
  name:string;
  city:string;
  country:string;
  description:string;
  type:string;
  adultCount:number;
  childCount:number;
  facilities:string[];
  pricePerNight:number;
  starRating:number;
  imageUrls:string[];
  lastUpdated:Date;
}
```

✅ **Final structure:**

```pgsql
backend/
 └── src/
     ├── models/
     ├── routes/
     ├── shared/
     │    └── types.ts
     └── index.ts
```

## 7. View My Hotel Deployment
- Push to GitHub:
- **Deploy on Render:**
	- Open your project on Render.
	- Click **“Deploy Latest Commit.”**
- View Site:
	- Open the live Render URL and check the **My Hotels** page.