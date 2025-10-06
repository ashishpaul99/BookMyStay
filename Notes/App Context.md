## 🧩 1. What is `AppContext`?
- `AppContext` is a **React Context** that lets you share data and functions (like `isLoggedIn`, `showToast`) across your whole app **without passing props manually** through every level of the component tree.
- You can think of it as a **global store** (lighter than Redux) — accessible from anywhere inside your app.
## 🏗️ 2. The goal of this Context
- Your `AppContext` handles two global things:
	1. ✅ **Authentication state** → whether the user is logged in (`isLoggedIn`)
	2. 💬 **Toast notifications** → success/error popups shown from anywhere (`showToast()`)
## 3. Code explanation (line-by-line)

**Step 1: Define types**
These tell TypeScript:
- What a toast message looks like
- What data/functions will be available from `AppContext`
```ts
type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
};
```

**Step 2: Create the Context**
- This creates an empty Context (like an empty box).  
- You’ll “fill” it with actual data in the **provider**.
```ts
const AppContext = React.createContext<AppContextType | undefined>(undefined);
```

**Step 3: Create the Provider Component**
- `toast` → stores the currently active toast message.
- `setToast` → updates it.
```ts
export const AppContextProvider = ({ children }: AppContextProviderProps) => {
const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
```

**Step 4: Validate user login with React Query**
- `validateToken` (from your API client) checks if the user’s token is valid.
- If it fails → `isError` becomes `true`, meaning the token is invalid → user is **not logged in**.
- If it succeeds → `isError` is `false` → user **is logged in**.
```ts
const { isError } = useQuery({
  queryKey: ["validateKey"],
  queryFn: apiClient.validateToken,
  retry: false,
});

```

**Hence:**
```ts
isLoggedIn: !isError
```

**Step 5: Provide the values**
You’re giving two things to all children:
1. `showToast()` → function to show a toast
2. `isLoggedIn` → Boolean for authentication
```ts
<AppContext.Provider
  value={{
    showToast: (toastMessage) => setToast(toastMessage),
    isLoggedIn: !isError,
  }}
>
```

**Step 6: Render children + toast**
- If there’s a toast message → show the `Toast` component.
- Then render the rest of your app (`children`).
```ts
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(undefined)}
  />
)}
{children}
```

**Step 7: Custom Hook**
```ts
export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};
```

- This hook lets you use context easily anywhere:
```ts
const { showToast, isLoggedIn } = useAppContext();
```