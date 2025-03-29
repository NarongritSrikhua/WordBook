const NavBar = () => {
    return (
       <nav className="class=nav_contain bg-white relative w-full xl:w-[1440px] px-4 md:px-8 lg:px-12 3lg:px-16 flex items-center justify-between h-[55px] md:h-[64px] py-2 md:py-4">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/" className="text-black text-xl font-bold">Word Book</a>
                <ul id="menu" className="hidden md:flex space-x-6 text-black">
                    <li><a href="/" className="hover:underline">Home</a></li>
                    <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
                    <li><a href="/book" className="hover:underline">Book</a></li>
                </ul>
            </div>
        </nav>
    )
};

export default NavBar;
