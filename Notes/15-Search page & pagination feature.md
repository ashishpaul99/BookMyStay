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

```

## 9. Add Search Bar Component to Layout.tsx
`Layout.tsx`
```tsx

```