import { useSearchContext } from "../contexts/SearchContext";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useState } from "react";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import HotelTypesFilter from "../components/HotelTypesFilter";
import HotelFacilitiesFilter from "../components/HotelFacilitiesFilter";
import HotelPriceFilter from "../components/HotelPriceFilter";

const Search = () => {
  const search = useSearchContext(); // Access search context values

  // 🧭 Store current page number in state
  const [page, setPage] = useState<number>(1);

  // ⭐ Store selected star ratings
  const [selectedStars, setSelectedStars] = useState<string[]>([]);

  // 🏨 Store selected hotel types
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);

  // 🏢 Store selected hotel facilities
  const [selectedHotelFacilities, setSelectedHotelFacilities] = useState<string[]>([]);

  // 💰 Store selected max price
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();

  // 🔽 Store sort option (star rating, price ascending/descending)
  const [sortOption, setSortOption] = useState<string>("");

  // 🧾 Create search parameters object to send to backend API
  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedHotelFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  // ⚡ Fetch hotel search results using React Query
  const { data: hotelData } = useQuery({
    queryKey: ["searchHotels", searchParams],
    queryFn: () => apiClient.searchHotels(searchParams),
  });

  // ⭐ Handle star rating filter changes
  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    );
  };

  // 🏨 Handle hotel type filter changes
  const handleHotelTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevTypes) =>
      event.target.checked
        ? [...prevTypes, hotelType]
        : prevTypes.filter((type) => type !== hotelType)
    );
  };

  // 🏢 Handle hotel facility filter changes
  const handleHotelFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hotelFacility = event.target.value;
    setSelectedHotelFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, hotelFacility]
        : prevFacilities.filter((facility) => facility !== hotelFacility)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      {/* Left Sidebar - Filters */}
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter By:
          </h3>

          {/* ⭐ Star Rating Filter */}
          <StarRatingFilter
            selectedStars={selectedStars}
            onChange={handleStarsChange}
          />

          {/* 🏨 Hotel Type Filter */}
          <HotelTypesFilter
            selectedHotelTypes={selectedHotelTypes}
            onChange={handleHotelTypeChange}
          />

          {/* 🏢 Hotel Facilities Filter */}
          <HotelFacilitiesFilter
            selectedHotelFacilities={selectedHotelFacilities}
            onChange={handleHotelFacilityChange}
          />

          {/* 💰 Hotel Price Filter */}
          <HotelPriceFilter
            selectedPrice={selectedPrice}
            onChange={(value?: number) => setSelectedPrice(value)}
          />
        </div>
      </div>

      {/* Right Side - Results and Sorting */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          {/* 🏨 Total Hotels Found */}
          <span className="text-xl font-bold">
            {hotelData?.pagination.total} Hotels found{" "}
            {search.destination ? `in ${search.destination}` : " "}
          </span>

          {/* 🔽 Sort Options */}
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="pricePerNightAsc">
              Price Per Night (low to high)
            </option>
            <option value="pricePerNightDesc">
              Price Per Night (high to low)
            </option>
          </select>
        </div>

        {/* 🧾 Display Hotels */}
        {hotelData?.data.map((hotel) => (
          <SearchResultsCard key={hotel._id} hotel={hotel} />
        ))}

        {/* 📄 Pagination */}
        <div>
          <Pagination
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
