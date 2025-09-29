import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";



// Define type for sign-in form fields
export type SignInFormData = {
  email: string;
  password: string;
};

const SignIn = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext(); // Access global toast function
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Initialize react-hook-form for handling form state & validation
  const {
    register, // function to register inputs
    handleSubmit, // function to handle form submit
    formState: { errors }, // object containing validation errors
  } = useForm<SignInFormData>();

  // Mutation for sign-in API call
  const mutation = useMutation({
    mutationFn: apiClient.SignIn, // call signIn function from apiClient
    onSuccess: async () => {
      showToast({ message: "Logged In Successfully!", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["validateKey"] });
      navigate("/"); // redirect to homepage
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  // Wrap submit handler with react-hook-form validation
  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data); // trigger API call with form data
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <h2 className="text-3xl font-bold">Sign In Page</h2>

      {/* Email Field */}
      <div>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Email
          <input
            type="email"
            className="border rounded w-full py-1 px-2"
            {...register("email", { required: "This field is required" })}
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </label>
      </div>

      {/* Password Field */}
      <div>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Password
          <input
            type="password"
            className="border rounded w-full py-1 px-2"
            {...register("password", { required: "This field is required" })}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </label>
      </div>
      
      {/* Submit Button */}
      <span className="flex justify-between items-center">
        <span className="text-sm">Not registered?{" "}<Link to="/register" className="underline">Create an account here</Link>
        </span>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500"
        >
          Sign In
        </button>
      </span>
    </form>
  );
};

export default SignIn;
