import Header from "../components/Header"
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
interface Props{
    children:React.ReactNode
}
const Layout=({children}:Props)=>{
    return <div className="flex flex-col min-h-screen ">
        <Header/>
        <div className="relative">
        <Hero />
          <div className="container mx-auto max-w-6xl  flex-1 items-center">
            <SearchBar />
          </div>
      </div>
        <div className="container mx-auto py-10 flex-1 max-w-6xl items-center">
            {children}
        </div>
        <Footer/>
    </div>
}

export default Layout;