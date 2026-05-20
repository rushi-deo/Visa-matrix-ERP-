import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Stepper from '../components/features/Stepper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import VisaFeeCard from '../components/features/VisaFeeCard';
import { fetchRequirementsByVisaTypeId, fetchVisaTypesByCountry } from '../services/visaData';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import './Application.css';

const Application = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data States
    const [countries, setCountries] = useState([]);
    const [visaTypes, setVisaTypes] = useState([]);
    const [requirements, setRequirements] = useState([]);

    // Selection States
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedVisa, setSelectedVisa] = useState(null);

    // Initial load: Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('countries')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;
                if (error) throw error;

                // Deduplicate countries based on code
                const uniqueCountries = Array.from(new Map(data.map(item => [item.code, item])).values());
                setCountries(uniqueCountries || []);

                // Pre-select country if passed via navigation state or URL param logic if needed
                // Note: Previous implementation used params, relying on state here for simplicity as per new request
                if (location.state?.selectedCountry) {
                    const preSelected = data.find(c => c.name === location.state.selectedCountry);
                    if (preSelected) {
                        setSelectedCountry(preSelected);
                        setCurrentStep(1); // Auto-move to next step if pre-selected
                    }
                }
            } catch (err) {
                console.error('Error fetching countries:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, [location.state]);

    // Fetch visa types when country is selected.
    useEffect(() => {
        const fetchVisaTypes = async () => {
            console.log('🔥 useEffect triggered', selectedCountry);

            if (!selectedCountry) return;

            setLoading(true);
            try {
                const countryId = String(selectedCountry.id);
                console.log('📌 countryId', countryId);

                const data = await fetchVisaTypesByCountry(countryId);
                console.log('[application] Visa types stored in state:', data);
                setVisaTypes(data);
            } catch (err) {
                console.error('Error fetching visa types:', err);
                setVisaTypes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVisaTypes();
    }, [selectedCountry]);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setSelectedVisa(null);
        setRequirements([]);
        setCurrentStep(1);
    };

    const handleVisaSelect = async (visa) => {
        const visaTypeId = String(visa.id);

        setSelectedVisa(visa);
        setLoading(true);

        try {
            console.log('[application] Selected visa_type_id:', visaTypeId);

            const data = await fetchRequirementsByVisaTypeId(visaTypeId);
            setRequirements(data);
            setCurrentStep(2);
        } catch (err) {
            console.error('Error fetching requirements:', err);
            setRequirements([]);
            setCurrentStep(2);
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Select Country', 'Visa Type', 'Summary'];

    const renderStepContent = () => {
        if (loading && !countries.length) return <div className="loading-spinner">Loading...</div>;

        switch (currentStep) {
            case 0: // Country Selection
                return (
                    <div className="step-content">
                        <h2>Select Destination Country</h2>
                        <div className="countries-grid-selection">
                            {countries.map(country => (
                                <div
                                    key={country.id}
                                    className={`country-select-card ${selectedCountry?.id === country.id ? 'selected' : ''}`}
                                    onClick={() => handleCountrySelect(country)}
                                >
                                    <div className="card-flag">
                                        <img src={country.flag_url} alt={country.name} />
                                    </div>
                                    <span className="country-name">{country.name}</span>
                                    {selectedCountry?.id === country.id && <CheckCircle size={20} className="check-icon" />}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 1: // Visa Selection
                return (
                    <div className="step-content">
                        <div className="step-header">
                            <img src={selectedCountry?.flag_url} alt="flag" className="header-flag" />
                            <h2>Visa Types for {selectedCountry?.name}</h2>
                        </div>

                        {loading ? (
                            <div className="loading-text">Fetching visa types...</div>
                        ) : visaTypes.length === 0 ? (
                            <div className="empty-state-card">
                                <AlertCircle size={48} />
                                <p>Visa types will be updated soon for this country.</p>
                                <Button variant="secondary" onClick={() => setCurrentStep(0)}>Select Different Country</Button>
                            </div>
                        ) : (
                            <div className="visa-fees-grid">
                                {visaTypes.map(visa => (
                                    <VisaFeeCard
                                        key={visa.id}
                                        visa={visa}
                                        isSelected={selectedVisa?.id === visa.id}
                                        onSelect={handleVisaSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 2: // Summary
                return (
                    <div className="step-content summary-step">
                        <h2>Review Application</h2>

                        <div className="summary-card">
                            <div className="summary-row">
                                <span className="label">Destination</span>
                                <div className="value-with-icon">
                                    <img src={selectedCountry?.flag_url} alt="flag" width="24" />
                                    {selectedCountry?.name}
                                </div>
                            </div>
                            <div className="summary-row">
                                <span className="label">Visa Type</span>
                                <span className="value">{selectedVisa?.visa_type}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Processing Time</span>
                                <span className="value">{selectedVisa?.processing_days} Days</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span className="label">Total Fee</span>
                                <span className="value">${selectedVisa?.fee_amount}</span>
                            </div>
                        </div>

                        <div className="requirements-card">
                            <h3>Requirements</h3>
                            {loading ? (
                                <p>Fetching requirements...</p>
                            ) : requirements.length === 0 ? (
                                <p>No requirements found for this visa type.</p>
                            ) : (
                                <ul>
                                    {requirements.map((requirement) => (
                                        <li key={requirement.id}>
                                            {requirement.requirement || requirement.name || requirement.title || requirement.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="action-buttons">
                            <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back</Button>
                            <Button size="lg" onClick={() => alert('Proceeding to Checkout...')}>
                                Continue / Apply Now <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container page-content application-container">
            <h1 className="text-center mb-xl">Start Your Application</h1>

            <Stepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={(step) => {
                    // Only allow clicking previous steps or current step
                    if (step <= currentStep) setCurrentStep(step);
                }}
            />

            <Card className="step-card-wrapper">
                {renderStepContent()}
            </Card>
        </div>
    );
};

export default Application;
