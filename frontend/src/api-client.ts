// Import the type for the registration form data
import type { RegisterFormData } from "./pages/Register";
import type {SignInFormData} from "./pages/SignIn"

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