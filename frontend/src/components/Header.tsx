import {Link} from "react-router-dom";
import {useAppContext} from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";
const Header=()=>{
    const {isLoggedIn}=useAppContext();
    return(
        <div className="bg-blue-800 py-6">
            <div className="container mx-auto flex justify-between max-w-6xl items-center">
                <span className="text-3xl text-white font-medium tracking-tight">
                    <Link to="/">BookMyStay.com</Link>
                </span>
                <span className="flex space-x-2 mr-20 ">
                     {
                        isLoggedIn?(<>
                           <Link className="flex items-center text-white px-2 font-bold hover:bg-blue-600" to="/mybookings">My Bookings</Link>
                           <Link className="flex items-center text-white px-2 font-bold hover:bg-blue-600" to="/myhotels">My Hotels</Link>
                           <SignOutButton/>
                        </>):
                        (<>
                           <Link to="/signin" className="flex items-center text-blue-800 bg-white px-3 py-1 ">Sign In</Link>
                           <Link to="/register" className="flex items-center text-blue-800 bg-white px-3 py-1 ">Sign Up</Link>
                        </>
                        
                        )
                     }
                     
                </span>
            </div>
        </div>
    )
}

export default Header;