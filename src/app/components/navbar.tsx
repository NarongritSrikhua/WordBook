import Link from "next/link";

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/contact">Contact</Link></li>
            </ul>
        </nav>
    )
};

export default NavBar;
