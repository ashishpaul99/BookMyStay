const Footer=()=>{
    return(
        <div className="bg-blue-800 py-5">
            <div className="container mx-auto flex flex-row justify-between max-w-6xl">
              <span className="text-3xl text-white font-bold tracking-tight">
                  BookMyStay.com
              </span>
              <span className="text-white font-bold tracking-tight flex gap-4">
                <p className="cursor-pointer">Privacy Policy</p>
                <p className="cursor-pointer">Terms of Services</p>
              </span>
                
            </div>
        </div>
    )

}

export default Footer;