import React, { useContext,useState} from "react";
import Toast from "../components/Toast";
import {useQuery} from "@tanstack/react-query";
import * as apiClient from "../api-client";


// Toast message type
type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

// Context value type
type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn:boolean;
};

// Create context
const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Provider props
type AppContextProviderProps = {
  children: React.ReactNode;
};

// Create the Provider Component
// toast → stores the currently active toast message.
// setToast → updates it.
export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [toast,setToast]=useState<ToastMessage | undefined>(undefined)

  // Validate user login with React Query
  const { isError } = useQuery({
  queryKey: ["validateKey"],  // Unique key for caching and identifying this query
  queryFn: apiClient.validateToken,// Function that will run to fetch/validate the token
  retry: false, // Disables automatic retry on failure (default is true)
  });


  return (
    <AppContext.Provider
     value={{
      showToast: (toastMessage) => {
      setToast(toastMessage);
     }, 
      isLoggedIn: !isError, 
    }}>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(undefined)}
      />
    )}
    {children}
    </AppContext.Provider>
  );
};

// Custom hook to let components easily access the AppContext provider
export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};

