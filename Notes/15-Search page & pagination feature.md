# 15-search page & pagination feature
`09:05:00`
## 1. Search functionality Overview
- The user enters search inputs such as **destination, adult count, child count**, and other filters.
- When they click the **Search** button, the entered criteria are **stored in a Search Context** (similar to the App Context).
- After storing the search criteria, the user is **redirected to the Search Page**.
- On the **Search Page**, the component:
	1. **Retrieves data** from the Search Context (like destination, filters, sorting criteria, etc.).
	2. **Combines all filters** and forms a query to send a **GET request to the backend**.
- The **backend processes the request**, fetches all hotels that **match the search criteria**, and returns them to the frontend.
- Finally, the frontend **displays the matching hotels** as the search results.
  ![](Images/Pasted%20image%2020251030144513.png)
  ![](Images/Pasted%20image%2020251030144638.png)
  ![](Images/Pasted%20image%2020251030144734.png)

- Sorting and filtering feature.
  ![](Images/Pasted%20image%2020251030144837.png)

  ## 2. Create Search API
  - Create a search API where frontend clients can call.
  - Create `hotel.ts` file in `backend/src/route/hotels.ts`.
  - Pagination is added as well.
  - It will be quite expensive on servers returning more number of hotels for every search hit especially if there are hundreds and thousands of people accessing the search endpoint at the same time.
  - define the page size this is the number of hotels that the frontend will get per request.
  ![](Images/Pasted%20image%2020251030154151.png)

### 🧩 What Pagination Does
- Pagination means **loading only a small portion of data at a time** instead of all at once.
- Example:  You have **50 hotels** in your database, but you want to show **5 per page** in your UI.
- We should have the **page number** sent from the frontend and store it in a **pageNumber variable** on the backend.
- Typically, when creating an API with pagination, it’s a good idea to **send pagination data back to the frontend** (like total pages, total items, and current page) so the frontend can determine **how many pages to display** and manage navigation properly.

**`backend/src/routes/hotel.ts`**
```ts
import express,{Request,Response} from "express";
import Hotel from "../models/hotel";
const router=express.Router();

// GET /api/search
router.get("/search", async (req: Request, res: Response) => {
  try {
    // Pagination setup
    const pageSize = 5;
    const pageNumber = parseInt(req.query.page?.toString() || "1");
    const skip = (pageNumber - 1) * pageSize;

    // Fetch paginated hotels
    const hotels = await Hotel.find().skip(skip).limit(pageSize);

    // Get total number of hotels
    const total = await Hotel.countDocuments();

    // Build response
    const response = {
      data: hotels,
      pagination: {
        total, // total number of hotels
        page: pageNumber, // current page
        pages: Math.ceil(total / pageSize), // total number of pages
      },
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
```

```ts
const pageSize = 5;
const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
```
- `pageSize = 5` → Each page will show 5 hotels.
- `pageNumber` → Comes from query string, e.g.
	- `/api/hotels?page=1` → pageNumber = 1
	- `/api/hotels?page=3` → pageNumber = 3
	
```ts
const skip = (pageNumber - 1) * pageSize;
```
- This tells MongoDB **how many documents to skip** before starting to return results
- So each time you go to the next page, you move forward by 5 hotels.

|Page Number|Skip Value|Meaning|
|---|---|---|
|1|(1 - 1) * 5 = 0|Don’t skip anything — show hotels 1–5|
|2|(2 - 1) * 5 = 5|Skip first 5 — show hotels 6–10|
|3|(3 - 1) * 5 = 10|Skip first 10 — show hotels 11–15|

```ts
const hotels = await Hotel.find().skip(skip).limit(pageSize);
```
- `.find()` → gets all hotels
- `.skip(skip)` → skips already seen ones
- `.limit(pageSize)` → limits the number of results returned to 5
- So if you’re on **page 3**, this returns **hotels 11–15** only.
## 3. Adding Types for Hotel Search Response (Backend & Frontend Integration)
- Add **TypeScript types** to the response object so it can also be reused in the **frontend**.
- This helps make it easier to access response data and **catch errors early** if anything changes later.
- In the backend project, go to the file:  `backend/src/shared/types.ts`
- Define the **shape (structure)** of the hotel search response like this:
 `backend/src/shared/types.ts`
```ts
// Defines the structure of the hotel search API response
export type HotelSearchResponse = {
  data: HotelType[];  // array of hotels returned from the search
  pagination: {
    total: number;    // total number of hotels in the database
    page: number;     // current page number
    pages: number;    // total number of pages
  };
};
```
## 4. Register `hotels.ts` Endpoint with the Express Server
- `app.use("/api/my-hotels", myHotelRoutes);` → This deals with the endpoints that the **currently logged-in user (owner)** needs to manage their own hotels.
- `app.use("/api/hotels", hotelRoutes);` → This deals with the endpoints that visitors to the website use to **search for hotels and view hotel details**.
**`index.ts`**
```ts
app.use("/api/my-hotels", myHotelRoutes);   // Routes for authenticated users (hotel owners) to manage their own hotels
app.use("/api/hotels", hotelRoutes);        // Public routes for website visitors to search and view hotels
```
- It means **all routes defined inside `hotelRoutes`** will be **prefixed** with `/api/hotels`.
- If `hotelRoutes` has:
```ts
router.get("/search", ...);
router.get("/:id", ...);
```
then you call the endpoints like:
- `GET /api/hotels/search` → for searching hotels
- `GET /api/hotels/12345` → for getting hotel with ID `12345`
## 5. Search Context
`09:19:00`
- Navigate to the `SearchContext.tsx` file in the `frontend/src/contexts` folder.
- This context stores the search criteria the user submitted in the form. Since these values are needed in many places in the app, using context makes them easier to access.
- define a function that will pass to out search bar component that it can call to save the values when the user hit submit.
```ts
const SearchContext = React.createContext<SearchContext | undefined>(undefined);
```

- `React.createContext<...>(...)`  
    This creates a new Context object using React' s Context API. 
- `<SearchContext | undefined>`  
    This is the **TypeScript generic type parameter**. It says: the context value will either be of type `SearchContext` (a custom type/interface you have defined) **or** `undefined`.
- `(undefined)`  
    This is the **default value** of the context. If a component consumes this context but is not wrapped in a Provider, it will receive `undefined` as its value.

```tsx
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContext;
}
```

- **`useContext(SearchContext)`**  
    This calls the built-in React hook `useContext`, passing in the `SearchContext` object. This returns the current value stored in that context (whatever has been provided by a corresponding `<SearchContext.Provider>` higher up in the component tree). 
- **`const context = …`**  
    We store that returned value in a variable named `context`.
- **`return context as SearchContext;`**  
    This uses a TypeScript **type assertion** (`as SearchContext`) to tell the compiler: “Trust me, `context` _is_ of type `SearchContext` (the type you defined for your context value)”.
- **Encapsulation via `useSearchContext`**  
    Instead of letting every component do `useContext(SearchContext)` and maybe handle `undefined`, this custom hook wraps that logic so that components can simply call `useSearchContext()` and get the context value (cleaner code).

```tsx
import React, { useContext, useState } from "react";
// Define the shape of the search context value
type SearchContext = {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  hotelId: string;
  saveSearchValues: (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number
  ) => void;
};

// Create the context with undefined as default value
const SearchContext = React.createContext<SearchContext | undefined>(undefined);

// Props for the provider component
type SearchContextProviderProps = {
  children: React.ReactNode;
};


// Create the context provider component
export const SearchContextProvider = ({children}: SearchContextProviderProps) => {

// State variables to store form values entered by the user
  const [destination, setDestination] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(1);
  const [hotelId, setHotelId] = useState<string>("");

  // Function to save and update search values in context
  const saveSearchValues = (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number,
    hotelId?: string
  ) => {
    // Update the state with new values
    setDestination(destination);
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);

    // Update hotelId only if provided
    if (hotelId) {
      setHotelId(hotelId);
    }
  };

  // Provide all state and function values to the children components
  return (
    <SearchContext.Provider
      value={{
        destination,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        hotelId,
        saveSearchValues,
      }}> {children}
      </SearchContext.Provider>
  );
};

// Create a hook for easy access to the search context
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContext;
};
```


## 6. Wrap the App with `SearchContextProvider`
- In `main.tsx`: Wrap the App component with `SearchContextProvider`

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClinet}>
      <AppContextProvider>
        <SearchContextProvider>
             <App />
         </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

## 7. Search Bar
`09:29:31`
- Create a search bar that includes fields for **destination**, **adult count**, **child count**, **check-in date**, **check-out date**, plus a **Search** button and **Clear** button.
- The search bar should overlap with the header section.
- After clicking the **Search** button, navigate to the search results page.
- Install package which gives data picker out of the box  → `npm i react-datepicker`  
  ![](Images/Pasted%20image%2020251030220626.png)

## 8. Search Bar Component
- Create Search bar component in frontend.
- Create `SearchBar.tsx` file in `frontend/src/components` folder.
- Values taken from the local state and save in global state after clicking search button.
`SearchBar.tsx`
```tsx
import { useState, type FormEvent } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css" //use default style sheet provided by them
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate=useNavigate();
  const search = useSearchContext();
  
  //store values in local state
  const [destination, setDestination] = useState<string>(search.destination);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);

  // values taken from local state and given to global state after submitting form.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Prevents the form from submitting normally and refreshing the page
    search.saveSearchValues(
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );
    navigate("/Search")
  };

  const minDate = new Date(); // today's date
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1); // max date is one year from today

  return (
    <form
      onSubmit={handleSubmit}
      className="-mt-8 p-3 bg-orange-400 rounded shadow-md grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4">
      <div className="flex flex-row items-center flex-1 bg-white p-2">
        <MdTravelExplore size={25} className="mr-2" />
        <input
          placeholder="Where are you going?"
          className="text-md w-full focus:outline-none"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        />
      </div>
      <div className="flex bg-white px-2 py-1 gap-2">
        <label className="items-center flex">
          Adults:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={1}
            max={20}
            value={adultCount}
            onChange={(event) => setAdultCount(parseInt(event.target.value))}
          ></input>
        </label>
        <label className="items-center flex">
          Children:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={0}
            max={20}
            value={childCount}
            onChange={(event) => setChildCount(parseInt(event.target.value))}
          ></input>
        </label>
      </div>
      <div>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-in Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div>

        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-in Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />

      </div>
      <div className="flex flex-row gap-2">
         <button className="w-2/3 bg-blue-600 text-white h-full p-2 font-bold text-xl hover:bg-blue-500 items-center">Search</button>
          <button className="w-1/3 bg-red-600 text-white h-full p-2 font-bold text-xl hover:bg-red-500 items-center">Clear</button>
      </div>
    </form>
  );
};
export default SearchBar;
```

![](Images/Pasted%20image%2020251031092249.png)
## 9. Add Search Bar Component to `Layout.tsx`
`Layout.tsx`
```tsx
const Layout=({children}:Props)=>{
    return <div className="flex flex-col min-h-screen ">
        <Header/>
        <div className="relative">
        <Hero />
          <div className="container mx-auto max-w-6xl  flex-1 items-center">
            <SearchBar />
          </div>
      </div>
        <div className="container mx-auto py-10 flex-1 max-w-6xl items-center">
            {children}
        </div>
        <Footer/>
    </div>
}
```
## 10. Add Search Page Route in Frontend
- When the **Search** button is clicked, it should navigate to the **Search** page.
- Add the **Search** page route in `App.tsx`, where all routes are defined.
**frontend/src/App.tsx**
```tsx
import Search from "./pages/Search";
<Route path="/search" element={<Layout><Search/></Layout>}/>
```
## 11. Create a Search Page
- Create a Search Page in the `pages` Folder
```tsx
import { useSearchContext } from "../contexts/SearchContext";
const Search=()=>{
  const search=useSearchContext();
  console.log(search);
  return(<div>
    <h2>Search Page</h2>
  </div>)
}
export default Search;
```


## 12. Search Page – Fetch Hotels
`09:53:00`
- Go to `apiClient.tsx` in the frontend and add a fetch request to call the search endpoint.
- Define a type for the search parameters — this helps track all search filters, parameters, and sort options when building the request.
- All parameters should be of type **string**, since query parameters in URLs must be sent as strings.
#####  Pagination 
- **Eg:**  `page: string // get page data back `  → to handle **pagination** on the search results page. for example, 10 hotels per page
- Imagine your API endpoint is like this:
```tsx
/api/hotels/search?destination=Goa&checkIn=2025-11-05&checkOut=2025-11-07&page=2
```

Here:
- `page=2` means → show the **second set of results** (e.g., hotels 11–20).
- If you click "Next" on the frontend, it changes to `page=3`, fetching the next 10 hotels.

##### URLSearchParams( )
- This line creates a **`URLSearchParams` object**, which is a built-in JavaScript utility for **working with URL query strings**
- `URLSearchParams` is a **built-in JavaScript Web API** — it comes directly from the browser (not from any library or package).
```tsx
const queryParams = new URLSearchParams();
queryParams.append("destination", searchParams.destination || "");
queryParams.append("checkIn", searchParams.checkIn || "");
queryParams.append("checkOut", searchParams.CheckOut || "");
queryParams.append("adultCount", searchParams.adultCount || "");
queryParams.append("childCount", searchParams.childCount || "");
queryParams.append("page", searchParams.page || "");
```

- If your `searchParams` object is:
```tsx
const searchParams = {
  destination: "kerala",
  checkIn: "2025-11-05",
  CheckOut: "2025-11-07",
  adultCount: "2",
  childCount: "1",
  page: "1"
};
```
- Then after appending: `queryParams.toString();
- ➡️ You’ll get: `destination=kerala&checkIn=2025-11-05&checkOut=2025-11-07&adultCount=2&childCount=1&page=1
- You can now attach this to a URL for an API call: 
```tsx
fetch(`/api/hotels/search?${queryParams.toString()}`);
```

**`apiClient.tsx`**
```tsx
// All parameters are strings because query parameters in URLs are sent as text.
	export type SearchParams={
	  destination?:string;
		  checkIn?:string;
	  CheckOut?:string;
	  adultCount?:string;
	  childCount?:string;
	  page?:string // used for pagination (to get results for a specific page)
	}

	// Function to fetch hotels from the backend based on search parameters
	export const
	searchHotels=async(searchParams:SearchParams):Promise<HotelSearchResponse>=>{

    // Create a URLSearchParams object to build query parameters
   const queryParams=new URLSearchParams();
   
    // Append each search parameter to the query string
   queryParams.append("destinaton", searchParams.destination || "")
   queryParams.append("checkIn", searchParams.checkIn || "")
   queryParams.append("checkOut", searchParams.CheckOut || "")
   queryParams.append("adultCount", searchParams.adultCount || "")
   queryParams.append("childCount", searchParams.childCount || "")
   queryParams.append("page", searchParams.page|| "");

   // Send GET request to the backend search endpoint with query parameters
   const response=await fetch(`${API_BASE_URL}/api/hotels/search?${queryParams}`);

   // If response is not OK (status not 200–299), throw an error
   if(!response.ok){
     throw new Error("Error fetching hotels");
   }

  // Parse and return the JSON response containing the hotel data
   return response.json();
}
```
`
## 12. Search Page
- Take the data entered by the user in the search form and convert it into a **Search Parameters object**.
- This object will be passed to the **fetch request**.
- The fetch request expects all parameters as **strings**, because **query parameters** in URLs must be of type `string`.
- The **`checkIn`** and **`checkOut`** parameters are `Date` objects, so convert them to strings using `toISOString()`.
- **`toISOString()`** is a JavaScript `Date` method that converts a `Date` object into a standardized **ISO 8601 string** format (used globally for timestamps).

```tsx
const date = new Date();
console.log(date.toISOString());//2025-10-31T10:23:45.678Z
```
-  Store current page number in state
```tsx
  // Store current page number in state
  const [page, setPage] = useState<number>(1);
```

- When search button is clicked then 5 results are shown up in the single page.
  ![](Images/Pasted%20image%2020251031155927.png)

**`frontend/src/pages/Search.tsx`**
```tsx
import { useSearchContext } from "../contexts/SearchContext";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useState } from "react";

const Search = () => {
  const search = useSearchContext();

  // Store current page number in state
  const [page, setPage] = useState<number>(1);

  //take stuff give by user and create SearchParams object
  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
  };

  const { data: HotelData } = useQuery({
    queryKey: ["searchHotels", searchParams],
    queryFn: () => apiClient.searchHotels(searchParams),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr]">
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter By:
          </h3>
        </div>
        {/*TODO FILTERS*/}
      </div>
      <div className="flex flex-col gap-5">
         <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
                {HotelData?.pagination.total} Hotels found {search.destination? `in ${search.destination}`:" "}
            </span>
            {/*TODO sort options*/}
         </div>
         {hotelData?.data.map((hotel)=>{
            <SearchResultCard hotel={hotel}/>
         })}
      </div>
   </div>
  );
};
export default Search;
```
#### Tailwind Styles
1. **Sticky** → means an element stays fixed **within its parent** while scrolling, until the parent is out of view.
2. `grid grid-cols-1 lg:grid-cols-[250px_1fr]`
	- `grid` → enables CSS Grid layout.
	- `grid-cols-1` → by default (on small screens), there’s **1 column**.
	- `lg:grid-cols-[250px_1fr]` → on **large screens (lg breakpoint and up)**, it defines **2 columns**:
		- first column → fixed width of **250px**
		- second column → takes up the **remaining space** (`1fr` = one fraction unit)

## 13. Search Result Card
- It has two columns.
	- Search results  
	- Filters 
![](Images/Pasted%20image%2020251031162323.png)
 
- Focus on search result cards and pagination
![](Images/Pasted%20image%2020251031162856.png)

- Hotel Card
![](Images/Pasted%20image%2020251031162346.png)

- Create `SearchResultsCard.tsx`  file in `frontend/src/components`
**`SearchResultsCard.tsx`**
```tsx
import type { HotelType } from "../../../backend/src/shared/types";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";

type Props = {
  hotel: HotelType;
};

const SearchResultsCard = ({ hotel }: Props) => {
  return (
    // single colume and image stacks on top of the rest of info
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8">
      <div className="w-full h-[300px]">
        <img
          src={hotel.imageUrls[0]}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="grid grid-rows-[1fr_2fr_1fr]">
        <div>
          <div className="flex items-center">
            <span className="flex">
              {Array.from({ length: hotel.starRating }).map(() => (
                <AiFillStar className="fill-yellow-400" />
              ))}
            </span>
            <span className="ml-1 text-sm">{hotel.type}</span>
          </div>

          {/* it takes to the detail page */}
          <Link
            to={`/details/${hotel._id}`}
            className="text-2xl font-bold cursor-pointer"
          >
            {hotel.name}
          </Link>
        </div>
        <div>
          <div className="line-clamp-4">{hotel.description}</div>
        </div>
        <div className="grid grid-cols-2 items-end whitespace-nowrap">
          <div className="flex gap-1 items-center">
            {hotel.facilities.slice(0, 3).map((facility) => (
              <span className="bg-slate-300 p-2 rounded-lg font-bold text-xs whitespace-nowrap">
                {facility}
              </span>
            ))}
            <span className="text-sm">
              {hotel.facilities.length > 3 &&
                `+${hotel.facilities.length - 3} more`}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-bold">
              ₹{hotel.pricePerNight}
              <span className="ml-1 font-normal">Per night</span>
            </span>
            <Link
              to={`/details/${hotel._id}`}
              className="bg-blue-600 text-white h-full p-2 font-bold text-xl max-w-fit hover:bg-blue-500"
            >
              View More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchResultsCard;
```
- After completing search result card component add functionality when user clicks on view more button or click on hotel name it takes them to hotel details page.
- Change hotel name tag to Link and do same to the View More button.
**`SearchResultsCard.tsx`**
```tsx
 {/* it takes to the detail page */}
<Link to={`/details/${hotel._id}`} className="text-2xl font-bold cursor-pointer">{hotel.name}</Link>
<Link to={`/details/${hotel._id}`} className="bg-blue-600 text-white h-full p-2 font-bold text-xl max-w-fit hover:bg-blue-500">View More</Link>
```
#### Tailwind Styles
1. `grid grid-cols-1 xl:grid-cols-[2fr_3fr]`
	- `grid` = use CSS grid layout  
	- `grid-cols-1` = 1 column on small screens  
	- `xl:grid-cols-[2fr_3fr]` = 2 columns on extra-large screens — first 40%, second 60%.
2. `w-full h-full object-cover object-center`
	- `w-full` → make the element take **full width** of its parent.  
	- `h-full` → make it take **full height** of its parent.  
	- `object-cover` → the image fills the box **without stretching**, cropping if needed.  
	- `object-center` → keeps the **center of the image** visible when cropped.
3. `line-clamp-4` → shows only **4 lines of text**, hides the rest with **“...”**.
4. `flex flex-col items-end gap-1`
	- **`flex`** → Enables flexbox layout.
	- **`flex-col`** → Arranges child elements vertically (in a column).
	- **`items-end`** → Aligns all items to the right end (horizontally).
	- **`gap-1`** → Adds a small space (4px) between each child element.
5. `max-w-fit` → sets the **maximum width** of an element to fit its **content size** only — it won’t stretch to fill the container.
## 14. Search Page Pagination
`10:29:00`
- Create  `Pagination.tsx` file in `frontend/src/components` folder.
**`Pagination.tsx`**
```tsx
export type Props={
    page:number;  //current page number
    pages:number; //no of pages
    onPageChange:(page:number)=>void;
};

const Pagination=({page,pages,onPageChange}:Props)=>{
    const pageNumbers=[]; //Array of page number
    for(let i=1;i<=pages;i++){
        pageNumbers.push(i);
    }
    return(
        <div className="flex justify-center">
            <ul className="flex border border-slate-300">
               {pageNumbers.map((number)=>(
                  <li className={`px-2 py-1 ${page==number?"bg-gray-200":""}`}>
                     <button onClick={()=>onPageChange(number)}>{number}</button>
                   </li>
               ))}
            </ul>
        </div>
    )
};
export default Pagination;
```

**`Search.tsx`**
```tsx
import { useSearchContext } from "../contexts/SearchContext";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useState } from "react";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";

const Search = () => {
  const search = useSearchContext();
  
  // Store current page number in state
  const [page, setPage] = useState<number>(1);

  //take stuff give by user and create SearchParams object
  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
  };

  const { data: hotelData } = useQuery({
    queryKey: ["searchHotels", searchParams],
    queryFn: () => apiClient.searchHotels(searchParams),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter By:
          </h3>
        </div>
        {/*TODO FILTERS*/}
      </div>
      <div className="flex flex-col gap-5">
         <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
                {hotelData?.pagination.total} Hotels found {search.destination? `in ${search.destination}`:" "}
            </span>
            
            {/*TODO sort options*/}
         </div>
         {hotelData?.data.map((hotel) => (
             <SearchResultsCard key={hotel._id} hotel={hotel} />
         ))}
         <div>
          <Pagination page={hotelData?.pagination.page || 1} pages={hotelData?.pagination.pages || 1}
          onPageChange={(page)=>setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
```

**`SearchResultsCard`**
```tsx
import type { HotelType } from "../../../backend/src/shared/types";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";

type Props = {
  hotel: HotelType;
};

const SearchResultsCard = ({ hotel }: Props) => {
  return (
  
    // single colume and image stacks on top of the rest of info
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8">
      <div className="w-full h-[300px]">
        <img
          src={hotel.imageUrls[0]}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="grid grid-rows-[1fr_2fr_1fr]">
        <div>
          <div className="flex items-center">
            <span className="flex">
              {Array.from({ length: hotel.starRating }).map(() => (
                <AiFillStar className="fill-yellow-400" />
              ))}
            </span>
            <span className="ml-1 text-sm">{hotel.type}</span>
          </div>

          {/* it takes to the detail page */}
          <Link
            to={`/details/${hotel._id}`}
            className="text-2xl font-bold cursor-pointer"
          >
            {hotel.name}
          </Link>
        </div>

        <div>
          <div className="line-clamp-4">{hotel.description}</div>
        </div>
        <div className="grid grid-cols-2 items-end whitespace-nowrap">
          <div className="flex gap-1 items-center">
            {hotel.facilities.slice(0, 3).map((facility) => (
              <span className="bg-slate-300 p-2 rounded-lg font-bold text-xs whitespace-nowrap">
                {facility}
              </span>
            ))}
            <span className="text-sm">
              {hotel.facilities.length > 3 &&
                `+${hotel.facilities.length - 3} more`}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-bold">
              ₹{hotel.pricePerNight}
              <span className="ml-1 font-normal">Per night</span>
            </span>
            <Link
              to={`/details/${hotel._id}`}
              className="bg-blue-600 text-white h-full p-2 font-bold text-xl max-w-fit hover:bg-blue-500"
            >
              View More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchResultsCard;
```


- Filtering and Sorting
  ![](Images/Pasted%20image%2020251031234750.png)
  ![](Images/Pasted%20image%2020251031235550.png)


## 15. Construct MongoDB Query Object Based on URL Search Parameters
- Go to the `hotel.ts` file in `backend/src/routes.
- Add the required filters inside the `constructSearchQuery()` function.
- This function **builds a MongoDB query object** based on the filters provided by the user in the URL (for example: `?destination=paris&stars=5&maxPrice=3000`).
```tsx
// 🔍 Construct MongoDB Query Object Based on URL Search Parameters
const constructSearchQuery = (queryParams: any) => {
  // Initialize an empty object to store the query filters
  let constructedQuery: any = {};

  // 🏙️ Filter by destination (match city or country using case-insensitive regex)
  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  // 👨‍👩‍👧 Filter by minimum number of adults
  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount), // $gte means “greater than or equal to”
    };
  }

  // 👶 Filter by minimum number of children
  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  // 🏊 Filter by facilities (hotel must have *all* listed facilities)
  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities // if multiple facilities passed as array
        : [queryParams.facilities], // convert single facility into array
    };
  }

  // 🏠 Filter by hotel types (match any of the selected types)
  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  // ⭐ Filter by star ratings
  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings }; // match any of the given ratings
  }

  // 💰 Filter by maximum price per night
  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(), // $lte means “less than or equal to”
    };
  }

  // Return the final MongoDB query object
  return constructedQuery;
};
```
##### Function Call
```tsx
const query = constructSearchQuery(req.query);
```
- `req.query` → all URL query parameters from the client.  
  Example:
```bash
/hotels?destination=paris&adultCount=2&stars=5
```
gives
```tsx
req.query = {
  destination: "paris",
  adultCount: "2",
  stars: "5"
}
```

##### Function Definition
```tsx
const constructSearchQuery = (queryParams: any) => {
let constructedQuery: any = {};
```
- It takes `queryParams` (which is `req.query`)
- It creates an empty object `constructedQuery = {}`  
    → This will hold conditions for your MongoDB `.find()` query.
##### Destination filter
```tsx
if (queryParams.destination) {
  constructedQuery.$or = [
    { city: new RegExp(queryParams.destination, "i") },
    { country: new RegExp(queryParams.destination, "i") },
  ];
}
```
- 👉 If the user typed a destination (like “Paris”):
	- Search hotels where **city OR country** match “Paris” (case-insensitive).
	- Uses MongoDB `$or` and **regex** for partial matching.
- Example output: `{ $or: [{ city: /paris/i }, { country: /paris/i }] }`
##### Adult & Child count filters
👉 Filters hotels that can accommodate **at least** that many adults or children.
```tsx
if (queryParams.adultCount) {
  constructedQuery.adultCount = { $gte: parseInt(queryParams.adultCount) };
}
if (queryParams.childCount) {
  constructedQuery.childCount = { $gte: parseInt(queryParams.childCount) };
}
```
Example output: `{ adultCount: { $gte: 2 }, childCount: { $gte: 1 } }`
##### Facilities filter
```tsx
if (queryParams.facilities) {
  constructedQuery.facilities = {
    $all: Array.isArray(queryParams.facilities)
      ? queryParams.facilities
      : [queryParams.facilities],
  };
}
```
👉 Filters hotels that have **all specified facilities** (like WiFi, Pool).
- `$all` = must include all items in the array.
Example: `?facilities=wifi&facilities=pool`
becomes: `{ facilities: { $all: ["wifi", "pool"] } }`
##### Types filter
```tsx
if (queryParams.types) {
  constructedQuery.type = {
    $in: Array.isArray(queryParams.types)
      ? queryParams.types
      : [queryParams.types],
  };
}
```
👉 Filters hotels where the **type** is one of the selected ones (e.g., “resort”, “villa”).
- `$in` = matches any value in the array.
##### Star rating filter
👉 Filters hotels by star ratings (e.g., 4-star, 5-star).
```tsx
if (queryParams.stars) {
  const starRatings = Array.isArray(queryParams.stars)
    ? queryParams.stars.map((star: string) => parseInt(star))
    : parseInt(queryParams.stars);

  constructedQuery.starRating = { $in: starRatings };
}
```
Case 1 – multiple stars: `?stars=3&stars=4` Then: 
- Finds hotels with 3⭐ or 4⭐.
```js
starRatings = [3, 4];
constructedQuery = { starRating: { $in: [3, 4] } };
```

Case 2 – single star: `?stars=5` Then:
- Finds hotels with 5⭐.
```js
starRatings = 5;
constructedQuery = { starRating: { $in: [5] } };
```
##### Max price filter
👉 Filters hotels whose `pricePerNight` ≤ given max price.
```tsx
if (queryParams.maxPrice) {
  constructedQuery.pricePerNight = {
    $lte: parseInt(queryParams.maxPrice).toString(),
  };
}
```
##### Return the final query
```js
return constructedQuery;
```

Then:
```js
query = {
  $or: [{ city: /paris/i }, { country: /paris/i }],
  adultCount: { $gte: 2 },
  starRating: { $in: [5] },
  pricePerNight: { $lte: "3000" }
}
```
- Then this query is passed to MongoDB: `Hotel.find(query)`
- This function converts URL search filters into a **MongoDB query object** that can be used to fetch matching hotels.

**`hotel.ts`**
```ts

```