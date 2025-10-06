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
            className="border rounded w-full p-2 resize-none font-normal"
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
            {...register("starRating", { required: "This field is required" })} 
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
