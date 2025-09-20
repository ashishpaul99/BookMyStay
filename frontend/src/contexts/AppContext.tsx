// define type of context which holds all the properties that we are going to expost to out components or the things all the components can access

type ToastMessage={
    message:string;
    type:"SUCCESS" | "ERROR";
}
type AppContext={
    showToast:(toastMessage:ToastMessage)=> void;
}

// creating context
const AppContext=React.createContext<AppContext | undefined>(undefined);

// creating provider - it wraps out componnets and give our components access to all the things in the context  
export const AppContextProvider=()=>{
    
}
