import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './Navbar.css';

const Navbar = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="navbar">
            <div className="navbar-container">
                {/* BRAND */}
                <Link to="/" className="navbar-brand">
                    <img src="/src/assets/logo.jpg" alt="Visa Matrix Logo" />
                </Link>

                {/* DESKTOP MENU */}
                <nav className="navbar-desktop">
                    <ul className="navbar-menu">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/countries">Countries</Link></li>
                        <li><Link to="/services">Visa Services</Link></li>
                        <li><Link to="/track">Track Application</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                    <Button>Apply Now</Button>
                </nav>

                {/* HAMBURGER */}
                <button
                    className="hamburger"
                    onClick={() => setOpen(!open)}
                    aria-label="Menu"
                >
                    ☰
                </button>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="navbar-mobile">
                    <div className="mobile-brand">
                        <img src="/src/assets/logo.jpg" alt="Visa Matrix Logo" />
                    </div>

                    <Link to="/" onClick={() => setOpen(false)}>Home</Link>
                    <Link to="/countries" onClick={() => setOpen(false)}>Countries</Link>
                    <Link to="/services" onClick={() => setOpen(false)}>Visa Services</Link>
                    <Link to="/track" onClick={() => setOpen(false)}>Track Application</Link>
                    <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>

                    <Button>Apply Now</Button>
                </div>
            )}
        </header>
    );
};

export default Navbar;
