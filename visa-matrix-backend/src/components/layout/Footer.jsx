import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            {/* Assuming logo is handled via img tag based on earlier context */}
                            <span>Visa Matrix</span>
                        </div>
                        <p className="footer-description">
                            Simplifying visa applications for travelers worldwide.
                            Fast, secure, and reliable processing for all your travel needs.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4 className="footer-title">Company</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-links">
                        <h4 className="footer-title">Support</h4>
                        <ul>
                            <li><a href="/help">Help Center</a></li>
                            <li><a href="/status">Track Application</a></li>
                            <li><a href="/faq">FAQs</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-links">
                        <h4 className="footer-title">Contact</h4>
                        <ul>
                            <li><a href="mailto:support@visamatrix.com">support@visamatrix.com</a></li>
                            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Visa Matrix. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
