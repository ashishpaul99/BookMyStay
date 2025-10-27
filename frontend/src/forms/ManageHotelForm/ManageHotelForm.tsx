import {FormProvider, useForm} from "react-hook-form";
import DetailsSection from "../ManageHotelForm/DetailsSection"
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImageSection from "./ImagesSection";
export type HotelFormData={
    name:string;
    city:string;
    country:string;
    description:string;
    type:string,
    pricePerNight:number,
    starRating:number,
    facilities:string[],
    imageFiles:FileList,
    adultCount:number;
    childCount:number;
};

type Props={
    onSave:(hotelFormData:FormData)=>void
    isLoading:boolean
}


const  ManageHotelForm=({onSave,isLoading}:Props)=>{
    const formMethods=useForm<HotelFormData>();
    const {handleSubmit}=formMethods;

    // Submit the form
    const onSubmit=handleSubmit((formDataJson:HotelFormData)=>{

        // create new FormData object and call our API
        // Convert JSON form data into FormData object
        // FormData only accepts strings or Blob/File objects
        const formData=new FormData();
        formData.append("name",formDataJson.name);
        formData.append("city",formDataJson.city);
        formData.append("country",formDataJson.country);
        formData.append("description",formDataJson.description);
        formData.append("type",formDataJson.type);
        formData.append("pricePerNight",formDataJson.pricePerNight.toString());;
        formData.append("starRating",formDataJson.starRating.toString());
        formData.append("adultCount",formDataJson.adultCount.toString());
        formData.append("childCount",formDataJson.childCount.toString());

         // Append facilities array
        formDataJson.facilities.forEach((facility,index)=>{
            formData.append(`facilities[${index}]`,facility);
        })

        // Convert FileList to array to use forEach; 
        // Multer on the backend handles the files and attaches them to the request
        Array.from(formDataJson.imageFiles).forEach((imageFile) => {
            formData.append("imageFiles", imageFile); 
        });
        // console.log(formData);

        onSave(formData);
    })

    return(
        <FormProvider {...formMethods}>
            <form className="flex flex-col gap-10" onSubmit={onSubmit}>
                <DetailsSection/>
                <TypeSection/>
                <FacilitiesSection/>
                <GuestsSection/>
                <ImageSection/>
                <span className="flex justify-end">
                    <button 
                    disabled={isLoading}
                    type="submit" className="bg-blue-600 text-white px-3 py-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500">
                    {isLoading?"Saving...":"Save"}
                    </button>
                </span>
            </form>
        </FormProvider>
    )
}
export default ManageHotelForm;