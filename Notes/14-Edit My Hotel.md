# 14-Edit My Hotel
- When the user clicks on the **“View Details”** button, they should be navigated to the **Edit Hotel** page.
- On the **Edit Hotel** page, the user can update the hotel details and click the **“Save”** button to save the changes.
- Create an endpoint to **fetch a user’s hotel by its ID**.
- Implement the **Edit Hotel** page that displays a pre-filled form with the existing hotel data.
- All hotel-related endpoints — **add hotel**, **view hotel**, and **edit hotel** — are located in the `my-hotels.ts` file.
![](Images/Pasted%20image%2020251028194249.png)
![](Images/Pasted%20image%2020251029113204.png)
![](Images/Pasted%20image%2020251029112927.png)

## 1. Add edit my hotel route in backend
- **`backend/src/routes/my-hotels.ts`**
```ts
// /api/my-hotels/1234
router.get("/:id",verifyToken,async (req:Request,res:Response)=>{
    const id=req.params.id.toString();//"1234";
    try{
       const hotel=await Hotel.findOne({
          _id:id,
          userId:req.userId
       })

       if(!hotel){
         return res.status(404).json({message:"Hotel not found"});
       }
       res.json(hotel);
    }catch(error){
        res.status(500).json({message:"Error fetching hotels"});
    }
})
export default router;
```

## 2. Add the `fetchMyHotelsById` Function to `api-client.ts`

```ts
import type { RegisterFormData } from "./pages/Register";
import type {SignInFormData} from "./pages/SignIn"
import type {HotelType} from "../../backend/src/shared/types"

// Import environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "" ;

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching hotel");
  }

  return response.json(); // returns the JSON data of the requested hotel
};
```


## 3. Edit Hotel Page in `pages`
- When navigating to the edit page, the **hotel ID** will be passed in the **URL** (e.g., `/edit-hotel/:hotelId`).
- The option `enabled: !!hotelId` ensures that the React Query will **only run** when a valid `hotelId` exists.
- The expression `!!hotelId` converts the value to a boolean:
    - If `hotelId` has a valid value → it becomes `true`.
    - If `hotelId` is `undefined`, an empty string, or `null` → it becomes `false`, which means the query **will not execute** until `hotelId` is available.
**`frontend/src/pages/EditHotel.tsx`**
```ts
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
const EditHotel=()=>{
   const {hotelId}=useParams<{hotelId:string}>();
   const { data: hotel } = useQuery({
	    queryKey: ["fetchMyHotelById", hotelId],
	    queryFn: () => apiClient.fetchMyHotelById(hotelId!),
	    enabled: !!hotelId,
   });

   return <ManageHotelForm hotel={hotel}/>
}
```

### Making changes to the `<ManageHotelForm />` component
- Pass the `hotel` as a prop to the `<ManageHotelForm />` component.
- Update the `Props` type in `ManageHotelForm` to include the `hotel` property.
- Use the `reset` function from `react-hook-form` inside a `useEffect` to populate the form with the existing hotel data whenever `hotel` changes.
**`frontend/src/froms/ManageHotelForm/ManageHotelForm.tsx`**
```tsx
type Props = { 
  hotel: HotelType;
  onSave: (hotelFormData: FormData) => void;
  isLoading: boolean;
}
const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  const formMethods = useForm<HotelFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    reset(hotel);
  }, [hotel, reset]);
};
```

## 4. Add the `EditHotel` Route in `App.tsx`

**`App.tsx`**
```tsx
 {isLoggedIn && <>
	<Route path="/add-hotel" element={<Layout>
	 <AddHotel/>
		 </Layout>}/>
			<Route path="/edit-hotel/:hotelId" element={<Layout><EditHotel/></Layout>}/>
			<Route path="/my-hotels" element={<Layout><MyHotels/></Layout>}/>
	 </>
 }
```

- View Details Button -> `MyHotels.tsx`
```ts
<span className="flex justify-end">
  <Link
    to={`/edit-hotel/${hotel._id}`}
    className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500 rounded-lg"
  >
    View Details
  </Link>
</span>
```

- When we click on **“View Details”**, it opens the **Edit Hotel** page.
- The hotel data is successfully populated in the form.
- However, the **images are not being populated** in the Edit Hotel form.
```json
"imageUrls": [
"https://res.cloudinary.com/de23dtkaz/image/upload/v1761563438/bao6sgeezyt0hhxircb5.jpg"
]
```

- Go to `ImageSection.tsx` in the `frontend/src/forms/ManageHotelForm` folder.
- Display the **existing images** added by the user so they can see them while editing the hotel details.
- Add the `imageUrls` field in `ManageHotelForm.tsx`.
- For deleting an image, remove its URL from the existing `imageUrls` array.
- Use the `setValue` function from **`useFormContext`** to update the form state when an image is deleted.
```tsx
import { useFormContext } from "react-hook-form"
import type { HotelFormData } from "./ManageHotelForm"

const ImageSection = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<HotelFormData>()

  const existingImageUrls = watch("imageUrls")

  // Delete image
  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    imageUrl: string
  ) => {
    event.preventDefault()
    setValue(
      "imageUrls",
      existingImageUrls.filter((url) => url !== imageUrl)
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className="border-rounded p-4 flex flex-col gap-4">
        {existingImageUrls && (
          <div className="grid grid-cols-6 gap-4">
            {existingImageUrls.map((url) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  className="w-full h-40 object-cover"
                  alt="Hotel"
                />
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300"
                  onClick={(event) => handleDelete(event, url)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="block text-gray-800 font-semibold mb-2">
          Upload Images
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
          {...register("imageFiles", {
            validate: (imageFiles) => {
              const totalLength =
                imageFiles.length + (existingImageUrls?.length || 0)
              if (totalLength === 0) {
                return "At least one image should be added"
              }
              if (totalLength > 6) {
                return "Total number of images cannot be more than 6"
              }
              return true
            },
          })}
        />
      </div>

      {errors.imageFiles && (
        <span className="text-red-500 text-sm font-bold">
          {errors.imageFiles.message}
        </span>
      )}
    </div>
  )
}

export default ImageSection
```

## 5. Add the update endpoint
- Add the update endpoint in `backend/routes/my-hotels.ts`.
- Add the upload image middleware.
**`my-hotels.ts`**
```ts
const hotel = await Hotel.findOneAndUpdate(
  { _id: req.params.hotelId, userId: req.userId },
  updatedHotel,
  { new: true }
)
```

- This tells MongoDB:
	- **Find** a hotel with:
		- `_id` equal to the `hotelId` from the URL (e.g. `/api/my-hotels/1234`)
		- `userId` equal to the logged-in user’s ID (`req.userId`)  
		  ✅ So users can update _only their own_ hotels.
		-  **Update** the found hotel document with the fields from `updatedHotel`.
		- `{ new: true }` → returns the **updated document**, not the old one.
		- Refractor  →  extract to function in module scope →  give function name.
```ts
const imageUrls = await uploadImages(imageFiles);
async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64"); // Convert image buffer to Base64
    const dataURI = `data:${image.mimetype};base64,${b64}`; // Create Data URI
    const uploadResponse = await cloudinary.uploader.upload(dataURI);
    return uploadResponse.secure_url; // Return secure Cloudinary URL
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}
```


✅ This merges the **newly uploaded images** (`updatedImageUrls`) with the **existing image URLs** (`updatedHotel.imageUrls`).
```ts
hotel.imageUrls = [
  ...updatedImageUrls,
  ...(updatedHotel.imageUrls || [])
];
```
- The spread operator (`...`) is used to combine both arrays.
- If `updatedHotel.imageUrls` is undefined (maybe the user had no previous images), it defaults to an empty array `[]`.
- So basically, this line **keeps old images and adds new ones on top**.
- 👉 User uploads new images → Multer catches them → `uploadImages()` uploads to Cloudinary → URLs are merged with old ones → Updated hotel saved in DB.

**`backend/src/routes/my-hotels.ts`**
```ts
router.post(
    "/:hoteId",
    verifyToken,
    upload.array("imageFiles"),
    async (req:Request,res:Response)=>{
   try{
    const updatedHotel:HotelType=req.body;
    updatedHotel.lastUpdated=new Date();
    const hotel=await Hotel.findOneAndUpdate(
        {
            _id:req.params.hotelId,
            userId:req.userId,
        },
        updatedHotel,
        {new:true}
    )

    // check if hotel exist or not
    if(!hotel){
        return res.status(404).json({message:"Hotel not found"});
    }

  
    // new files add by user
    const files=req.files as Express.Multer.File[];
    const updatedImageUrls=await uploadImages(files);
    hotel.imageUrls=[...updatedImageUrls,...(updatedHotel.imageUrls||[])
    ];
    await hotel.save();
    res.status(201).json(hotel); //sends the hotel back as json object
   }catch(error){
      res.status(500).json({message:"Something went wrong"});
   }
})

async function uploadImages(imageFiles: Express.Multer.File[]) {
    const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64"); // Convert image buffer to Base64 string
        let dataURI = "data:" + image.mimetype + ";base64," + b64; //Construct Data URI (MIME type + Base64 data)
        const uploadResponse = await cloudinary.uploader.upload(dataURI);
        return uploadResponse.secure_url; // safer than .url
    });

    // 2. If the upload is successful, add the URLs to the new hotel object.
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}
export default router;
```
## 6. Add Update Function in `apiClient.tsx`
- `apiClient.tsx` is a **central file** where you define and manage all your **API calls** (frontend → backend).  
- It helps keep your code **organized**, **reusable**, and **easy to maintain**.
**`apiClient.tsx`**
```tsx
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
```

## 7. Add put logic
- Go to the `EditHotel.tsx` page create on save function that we will pass to our manage hotel form component.
- Use mutation hook to call our put request.
```tsx
// Keep existing image URLs so they aren’t lost during update
if (formDataJson.imageUrls) {
  formDataJson.imageUrls.forEach((url, index) => {
    formData.append(`imageUrls[${index}]`, url);
  });
}
```
### Explanation:
When a user **updates** a hotel, there are **two types of images** involved:
1. **Old images** — already uploaded to Cloudinary and stored as URLs in the database.
2. **New images** — uploaded by the user during the edit process.

`ManageHotelForm.tsx`
```tsx
import {FormProvider, useForm} from "react-hook-form";
import DetailsSection from "../ManageHotelForm/DetailsSection"
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImageSection from "./ImagesSection";
import type { HotelType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";
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
    imageUrls:string[],
    adultCount:number;
    childCount:number;
};

type Props={
    hotel?:HotelType;
    onSave:(hotelFormData:FormData)=>void
    isLoading:boolean
}

const  ManageHotelForm=({onSave,isLoading,hotel}:Props)=>{
    const formMethods=useForm<HotelFormData>();
    const {handleSubmit,reset}=formMethods;
    useEffect(()=>{
        reset(hotel);
    },[hotel,reset]);

  
    // Submit the form
    const onSubmit=handleSubmit((formDataJson:HotelFormData)=>{

  
        // create new FormData object and call our API
        // Convert JSON form data into FormData object
        // FormData only accepts strings or Blob/File objects
        const formData=new FormData();
        if(hotel){
            formData.append("hotelId",hotel._id);
        }

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
       // Keep existing image URLs so they aren’t lost during update
       if (formDataJson.imageUrls) {
         formDataJson.imageUrls.forEach((url, index) => {
            formData.append(`imageUrls[${index}]`, url);
           });
        }
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
```


`EditHotel.tsx`
```tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
const EditHotel=()=>{
   const {showToast}=useAppContext();
   const {hotelId}=useParams<{hotelId:string}>();
   const { data: hotel } = useQuery({
    queryKey: ["fetchMyHotelById", hotelId],
    queryFn: () => apiClient.fetchMyHotelById(hotelId!),
    enabled: !!hotelId,
   });
   
   const {mutate, isPending}=useMutation({
      mutationFn:apiClient.updateMyHotelById,
      onSuccess:()=>{
         showToast({ message: "Hotel Updated!", type: "SUCCESS" });
      },

      onError:()=>{
         showToast({ message: "Error Updating Hotel", type: "ERROR" });
      }
   });

   const handleSave=(hotelFormData:FormData)=>{
      mutate(hotelFormData);
   }

   return <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isPending}/>

}
export default EditHotel;
```

## 8. Edit My Hotel Test
- Go to `manage-hotels.spec.ts` file which is in `e2e-tests/tests` folder.
- Write edit my hotel test in `manage-hotels.spec.ts` file .
```tsx
test("should edit hotel", async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);
  await page.getByRole("link", { name: "View Details" }).first().click();
  await page.waitForSelector('[name="name"]', { state: "attached" });
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel");
  
  await page.locator('[name="name"]').fill("Test Hotel Updated");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel Saved!")).toBeVisible();

  // Reload to verify the change persists after refresh
  await page.reload();
  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel Updated");
  await page.locator('[name="name"]').fill("Test Hotel");
});
```

## 8. Edit My Hotel Deployment
- Deployed edit my hotel feature to render.