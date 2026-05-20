import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Clock, Calendar, Shield, FileText } from 'lucide-react';
import Button from '../components/common/Button';
import './VisaDetails.css';

const VisaDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [country, setCountry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const fetchCountryDetails = async () => {
            try {
                setLoading(true);
                // slug path param acts as the country code
                const { data, error } = await supabase
                    .from('countries')
                    .select('*')
                    .eq('code', slug.toUpperCase())
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Country not found');

                setCountry(data);
            } catch (err) {
                console.error('Error fetching country:', err);
                setError('Failed to load country details.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCountryDetails();
        }
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToApply = () => {
        if (country) {
            navigate(`/apply/${country.code.toLowerCase()}`);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px' }}>Loading...</div>;
    if (error) return <div className="container" style={{ paddingTop: '100px' }}>{error}</div>;
    if (!country) return <div className="container" style={{ paddingTop: '100px' }}>Country not found</div>;

    // Default fallbacks if fields are missing in DB
    const heroImage = country.country_image || country.flag_url;
    const description = country.description || `Get your ${country.name} visa with our expert assistance. Fast, reliable, and hassle-free processing.`;

    // Construct fee list dynamically
    // Prioritize DB fields: service_fee, country_fee (embassy fee)
    // We assume these columns exist as per request. If they are null, we provide a placeholder or hide.
    const serviceFee = country.service_fee ? `$${country.service_fee}` : 'Contact us';
    const embassyFee = country.country_fee ? `$${country.country_fee}` : 'Varies';

    return (
        <>
            {/* HERO SECTION */}
            <div className="visa-hero" style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="container">
                    <div className="hero-main">
                        <span className="hero-flag" style={{ fontSize: '4rem' }}>
                            <img src={country.flag_url} alt={country.name} style={{ width: '60px', height: 'auto', borderRadius: '4px' }} />
                        </span>
                        <div className="hero-text">
                            <h1>{country.name} Visa Assistance</h1>
                            <p>{description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container content-wrapper">
                <div className="content-grid">

                    {/* LEFT COLUMN (MAIN INFO) */}
                    <div className="main-info">

                        {/* VISA INFO - Placeholder for now, can be dynamic later */}
                        <section className="detail-section">
                            <h2>Why Choose Us for {country.name}?</h2>
                            <div className="features-grid">
                                <div className="feature">
                                    <h3>Expert Guidance</h3>
                                    <p>Our team reviews every document to ensure maximum success.</p>
                                </div>
                                <div className="feature">
                                    <h3>Transparent Pricing</h3>
                                    <p>No hidden fees. You pay exactly what you see.</p>
                                </div>
                                <div className="feature">
                                    <h3>Dedicated Support</h3>
                                    <p>24/7 assistance through your application journey.</p>
                                </div>
                            </div>
                        </section>

                        {/* DOCUMENTS CHECKLIST - Could be dynamic later */}
                        <section className="detail-section">
                            <h2>Required Documents</h2>
                            <ul className="doc-checklist">
                                <li><FileText size={16} /> Valid Passport</li>
                                <li><FileText size={16} /> Recent Photographs</li>
                                <li><FileText size={16} /> Proof of Accommodation</li>
                                <li><FileText size={16} /> Return Flight Tickets</li>
                            </ul>
                        </section>

                        {/* PROCESS */}
                        <section className="detail-section">
                            <h2>Application Process</h2>
                            <div className="process-timeline">
                                <div className="timeline-step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">Apply Online & Pay Fees</div>
                                </div>
                                <div className="timeline-step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">Upload Documents</div>
                                </div>
                                <div className="timeline-step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">Expert Verification</div>
                                </div>
                                <div className="timeline-step">
                                    <div className="step-number">4</div>
                                    <div className="step-content">Get Your Visa</div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN (FEES & ACTION) */}
                    <div className="sidebar-container">
                        <div className="fees-card sticky-card">
                            <h3>Fees & Charges</h3>
                            <div className="fees-list">
                                <div className="fee-row">
                                    <span>Service Fee</span>
                                    <strong>{serviceFee}</strong>
                                </div>
                                <div className="fee-row">
                                    <span>Embassy Fee</span>
                                    <strong>{embassyFee}</strong>
                                </div>
                            </div>
                            <p className="disclaimer">* Fees are subject to change based on embassy regulations.</p>

                            <div className="sidebar-actions">
                                <Button className="w-full" onClick={scrollToApply}>Apply Now</Button>
                                <Button variant="ghost" className="w-full">Talk to an Expert</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE STICKY CTA */}
            <div className="mobile-sticky-cta">
                <div className="cta-info">
                    <span>Service Fee</span>
                    <strong>{serviceFee}</strong>
                </div>
                <Button onClick={scrollToApply}>Apply Now</Button>
            </div>
        </>
    );
};

export default VisaDetails;
