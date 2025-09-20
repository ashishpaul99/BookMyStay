// Import the type for the registration form data
import type { RegisterFormData } from "./pages/Register";

// Import environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Function to register a new user
export const register = async (formData: RegisterFormData) => {
    // Make a POST request to the /register endpoint
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json" // Tell server we're sending JSON
        },
        body: JSON.stringify(formData) // Convert form data to JSON string
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
