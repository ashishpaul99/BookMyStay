import {Link} from "react-router-dom"
const Header=()=>{
    return(
        <div className="bg-blue-800 py-6">
            <div className="container mx-auto flex justify-between max-w-6xl items-center">
                <span className="text-3xl text-white font-medium tracking-tight">
                    <Link to="/">BookMyStay.com</Link>
                </span>
                <span className="flex space-x-2 mr-20 ">
                     <Link to="/signin" className="flex items-center text-blue-800 bg-white px-3 py-1 ">Sign In</Link>
                </span>
            </div>
        </div>
    )
}

export default Header;