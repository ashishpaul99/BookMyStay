import { useFormContext } from "react-hook-form";
import type { HotelFormData } from "./ManageHotelForm";

const GuestSection = () => {
  const { register, formState: { errors } } = useFormContext<HotelFormData>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Guests</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 bg-gray-300 rounded">
        
        <label className="flex flex-col text-gray-700 text-sm font-semibold">
          <span className="mb-1 font-normal">Adults</span>
          <input
            type="number"
            min={1}
            className="border rounded px-3 py-2 w-full font-normal"
            {...register("adultCount", { required: "This field is required" })}
          />
          {errors.adultCount?.message && (
            <span className="text-red-500 text-sm font-bold">{errors.adultCount?.message}</span>
          )}
        </label>

        <label className="flex flex-col text-gray-700 text-sm font-semibold">
          <span className="mb-1 font-normal">Children</span>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2 w-full font-normal"
            {...register("childCount", { required: "This field is required" })}
          />
          {errors.childCount?.message && (
            <span className="text-red-500 text-sm font-bold">{errors.childCount?.message}</span>
          )}
        </label>

      </div>
    </div>
  );
};
export default GuestSection;
