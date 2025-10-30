export type HotelType={
  _id:string;
  userId:string;
  name:string;
  city:string;
  country:string;
  description:string;
  type:string;
  adultCount:number;
  childCount:number;
  facilities:string[];
  pricePerNight:number;
  starRating:number;
  imageUrls:string[];
  lastUpdated:Date;
}

// Defines the structure of the hotel search API response
export type HotelSearchResponse = {
  data: HotelType[];  // array of hotels returned from the search
  pagination: {
    total: number;    // total number of hotels in the database
    page: number;     // current page number
    pages: number;    // total number of pages
  };
};
