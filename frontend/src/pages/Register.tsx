import { useForm } from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import * as apiClient from "../api-client"; 

// Define TypeScript type for form data
export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};


const Register = () => {
  // useForm hook gives us helpers to register inputs, validate, and track errors
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();


    // Mutation handles API call + success/error states
  const mutation = useMutation(
    {
      mutationFn:apiClient.register, // call backend register function
      onSuccess:()=>{
         console.log("registration successful!"); 
      },
      // error comes from fetch request
      onError:(error:Error)=>{
        console.log(error.message); // log API error
      }
    }
  )

  // Runs only when form is valid (handleSubmit from react-hook-form)
  const onSubmit = handleSubmit((data) => {
     mutation.mutate(data) // send form data to apiClient.register
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      {/* Form title */}
      <h2 className="text-3xl font-bold">Create an Account</h2>

      {/* First Name & Last Name inputs side by side (on larger screens) */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* First Name */}
        <label className="text-gray-700 text-sm font-bold flex-1">
          First Name
          <input className="border rounded w-full py-1 px-2 font-bold" {...register("firstName", { required: "This field is required"})}/>

          {/* Error message */}
          {errors.firstName && (
            <span className="text-red-500">{errors.firstName.message}</span>
          )}
          
        </label>

        {/* Last Name */}
        <label className="text-gray-700 text-sm font-bold flex-1">
          Last Name
          <input
            className="border rounded w-full py-1 px-2 font-bold"
            {...register("lastName", {
              required: "This field is required",
            })}
          />
          {/* Error message */}
          {errors.lastName && (
            <span className="text-red-500">{errors.lastName.message}</span>
          )}
        </label>
      </div>

      {/* Email */}
      <label className="text-gray-700 text-sm font-bold flex-1">
        Email
        <input
          type="email"
          className="border rounded w-full py-1 px-2 font-bold"
          {...register("email", {
            required: "This field is required",
          })}
        />
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
      </label>

      {/* Password */}
      <label className="text-gray-700 text-sm font-bold flex-1">
        Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-bold"
          {...register("password", {
            required: "This field is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
      </label>

      {/* Confirm Password */}
      <label className="text-gray-700 text-sm font-bold flex-1">
        Confirm Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-bold"
          {...register("confirmPassword", {
            validate: (val) => {
              if (!val) {
                return "This field is required";
              } else if (watch("password") !== val) {
                return "Your passwords do not match";
              }
            },
          })}
        />
        {errors.confirmPassword && (
          <span className="text-red-500">
            {errors.confirmPassword.message}
          </span>
        )}
      </label>

      {/* Submit button */}
      <span>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500"
        >
          Create Account
        </button>
      </span>
    </form>
  );
};

export default Register;
