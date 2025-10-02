import { useMutation,useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";

const SignOutButton = () => {
  const queryClient=useQueryClient();
  const { showToast } = useAppContext();

  const mutation = useMutation({
    mutationFn: apiClient.signOut,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey:["validateKey"]});
      showToast({ message: "Logged out Successfully!", type: "SUCCESS" });
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const handleClick = () => {
    mutation.mutate();
  };

  return (
    <button
      onClick={handleClick}  
      className="text-blue-600 bg-white px-2 py-1 font-bold hover:bg-gray-100"
    >
      Sign Out
    </button>
  );
};
export default SignOutButton;
