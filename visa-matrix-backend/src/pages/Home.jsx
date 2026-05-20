import Button from '../components/common/Button';
import CountryCard from '../components/features/CountryCard';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            {/* HERO SECTION */}
            <div className="hero-wrapper">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Apply for Your Visa with Confidence</h1>
                        <p>
                            Fast, secure, and expert-guided visa support for top destinations.
                            We simplify the complex paperwork so you can focus on your journey.
                        </p>

                        <div className="hero-actions">
                            <Button size="lg">Start Your Application</Button>
                            <Button variant="outline-white" size="lg">Explore Countries</Button>
                        </div>
                    </div>


                </section>
            </div>

            {/* FEATURES SECTION (New) */}
            <section className="features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Fast Processing</h3>
                        <p>Get your visa in record time with our streamlined digital process.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Secure & Safe</h3>
                        <p>Bank-level encryption keeps your personal data and documents protected.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👨‍💼</div>
                        <h3>Expert Guidance</h3>
                        <p>Our visa experts review every application to minimize rejections.</p>
                    </div>
                </div>
            </section>

            {/* POPULAR DESTINATIONS */}
            <section className="popular-section">
                <div className="section-header">
                    <h2>Popular Destinations</h2>
                    <p>Get expert visa assistance for these top countries</p>
                </div>

                <div className="popular-grid">
                    <CountryCard
                        code="US"
                        name="United States"
                        description="From $185"
                    />
                    <CountryCard
                        code="CA"
                        name="Canada"
                        description="From $100"
                    />
                    <CountryCard
                        code="GB"
                        name="United Kingdom"
                        description="From £115"
                    />
                    <CountryCard
                        code="AU"
                        name="Australia"
                        description="From $150"
                    />
                </div>
            </section>

            {/* CTA BANNER (New) */}
            <section className="cta-banner">
                <div className="cta-content">
                    <h2>Ready to Start Your Journey?</h2>
                    <p>Join thousands of happy travelers who got their visas approved with Visa Matrix.</p>
                    <Button variant="secondary" size="lg">Get Started Now</Button>
                </div>
            </section>
        </div>
    );
};

export default Home;
