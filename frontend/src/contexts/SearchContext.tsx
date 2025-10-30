import React, { useContext, useState } from "react";

// Define the shape of the search context value
type SearchContext = {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  hotelId: string;
  saveSearchValues: (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number
  ) => void;
};

// Create the context with undefined as default value
const SearchContext = React.createContext<SearchContext | undefined>(undefined);

// Props for the provider component
type SearchContextProviderProps = {
  children: React.ReactNode;
};

// Create the context provider component
export const SearchContextProvider = ({
  children,
}: SearchContextProviderProps) => {
  // State variables to store form values entered by the user
  const [destination, setDestination] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(0);
  const [hotelId, setHotelId] = useState<string>("");

  // Function to save and update search values in context
  const saveSearchValues = (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number,
    hotelId?: string
  ) => {
    // Update the state with new values
    setDestination(destination);
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);

    // Update hotelId only if provided
    if (hotelId) {
      setHotelId(hotelId);
    }
  };

  // Provide all state and function values to the children components
  return (
    <SearchContext.Provider
      value={{
        destination,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        hotelId,
        saveSearchValues,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Create a hook for easy access to the search context
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContext;
};


