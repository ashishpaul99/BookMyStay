// Import the type for the registration form data
import type { RegisterFormData } from "./pages/Register";
import type {SignInFormData} from "./pages/SignIn"
import type {HotelSearchResponse, HotelType} from "../../backend/src/shared/types"

// Import environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "" ;


// Function to sign in a user
export const SignIn = async (formData: SignInFormData) => {
  // Send POST request to login endpoint
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include", // include cookies (session/JWT)
    headers: {
      "Content-Type": "application/json", // tell server we're sending JSON
    },
    body: JSON.stringify(formData), // send email + password
  });

  // Parse the response body as JSON
  const responseBody = await response.json();

  // If request failed, throw error with server message (or default)
  if (!response.ok) {
    throw new Error(responseBody.message || "Something went wrong");
  }

  // Return the response data (e.g., user info, token, etc.)
  return responseBody;
};


// Function to register a new user
export const register = async (formData: RegisterFormData) => {
    // Make a POST request to the /register endpoint
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        credentials:"include",
        headers: {
            "Content-Type": "application/json" // Tell server we're sending JSON
        },
        body: JSON.stringify(formData), // Convert form data to JSON string
        
    });

    // Parse the JSON response
    const responseBody = await response.json();

    // If the response is not OK then throw an error
    if (!response.ok) {
        throw new Error(responseBody.message || "Registration failed");
    }

    // Optionally, return response data if needed
    return responseBody;
};

export const validateToken=async ()=>{
    const response=await fetch(`${API_BASE_URL}/api/auth/validatetoken`,{
        credentials:"include", //send any ccokies with req
    })
    if(!response.ok){
        throw new Error("Token invalid")
    }
    return response.json();
}

export const signOut=async()=>{
    const response=await fetch(`${API_BASE_URL}/api/auth/logout`,{
        method:'POST',
        credentials:'include'
    });

    if(!response.ok){
       throw new Error("Error during sign out")
    }
}

/**
 * Sends a POST request to add a new hotel using FormData.
 * @param hotelFormData - FormData object containing hotel details and image files
 * @returns The added hotel data as JSON
 * @throws Error if the request fails
 */
export const addMyHotel = async (hotelFormData: FormData) => {
  // Send POST request to the backend API
  const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
    method: "POST",
    credentials: "include", // send cookies with the request if any
    body: hotelFormData,    // FormData handles text fields and file uploads
  });

  // Check if the response is not successful
  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }

  // Parse and return JSON response (contains the added hotel)
  return response.json();
};

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

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotel");
  }

  return response.json(); // returns the JSON data of the requested hotel
};


export const updateMyHotelById = async (hotelFormData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`, {
    method: "PUT",
    body: hotelFormData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to update hotel");
  }

  return response.json();
};




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
export const searchHotels=async(searchParams:SearchParams):Promise<HotelSearchResponse>=>{

    // Create a URLSearchParams object to build query parameters
   const queryParams=new URLSearchParams();

    // Append each search parameter to the query string
   queryParams.append("destination", searchParams.destination || "")
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
