import { useFormContext } from "react-hook-form"
import type { HotelFormData } from "./ManageHotelForm"

const ImageSection=()=>{
    const {
        register,
        formState:{errors},
        watch,
        setValue,
    }=useFormContext<HotelFormData>();

    const existingImageUrls=watch("imageUrls")

    // delete image 
    const handleDelete=async (
        event:React.MouseEvent<HTMLButtonElement,MouseEvent>, 
        imageUrl:string
    )=>{
        event.preventDefault();
        setValue("imageUrls",existingImageUrls.filter((url)=>url!==imageUrl))
    }

    return(
        <div>
           <h2 className="text-2xl font-bold mb-3">Images</h2>
           <div className="border-rounded p-4 flex flex-col gap-4">
            {existingImageUrls &&(
                <div className="grid grid-cols-6 gap-4">
                   {existingImageUrls.map((url) => (
                     <div key={url} className="relative group">
                    <img src={url} className="w-full h-40 object-cover" alt="Hotel" />
                    <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300" onClick={(event) => handleDelete(event, url)}>Delete
                    </button>
              </div>
            ))}
        </div>
            )}
              <label className="block text-gray-800 font-semibold mb-2">Upload Images
              </label>
              <input 
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-sm text-gray-700
               border border-gray-300 rounded-xl
               cursor-pointer bg-gray-50 p-2.5
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-600 file:text-white
               hover:file:bg-blue-500"
                {...register("imageFiles",{
                validate:(imageFiles)=>{
                    const totalLength=imageFiles.length + (existingImageUrls?.length || 0);
                    if(totalLength===0){
                        return "At least on image should be added"
                    }
                    if(totalLength>6){
                        return "Total number of images cannot be more than 6"
                    }
                    return true;
                }
              })}/>
           </div>
           {
            errors.imageFiles && (<span className="text-red-500 text-sm font-bold">{errors.imageFiles.message}</span>)
           }
        </div>
    )
}
export default ImageSection;