import {FormProvider, useForm} from "react-hook-form";
import DetailsSection from "../ManageHotelForm/DetailsSection";
import TypeSection from "./TypeSection";
export type HotelFormData={
    name:string;
    city:string;
    country:string;
    description:string;
    type:string;
    pricePerNight:number;
    starRating:number;
    facilities:string[];
    imageFiles:FileList;
    adultCount:number;
    chldCount:number;
}
const ManageHotelForm=()=>{
    const formMethods=useForm<HotelFormData>();
    return(<FormProvider {...formMethods}>
            <form className="flex flex-col gap-5">
              <DetailsSection/>
              <TypeSection/>
            </form>
        </FormProvider>
    )
}
export default ManageHotelForm;