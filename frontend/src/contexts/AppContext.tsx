import React, { useContext,useState} from "react";
import Toast from "../components/Toast";


// Toast message type
type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

// Context value type
type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
};

// Create context
const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Provider props
type AppContextProviderProps = {
  children: React.ReactNode;
};

// Provider component
export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [toast,setToast]=useState<ToastMessage | undefined>(undefined)
  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
           setToast(toastMessage);
        }, 
      }}
    >
      {toast && (<Toast message={toast.message} type={toast.type} onClose={()=>setToast(undefined)}/>)}
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to let components easily access the AppContext provider
export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};

