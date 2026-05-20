import React from 'react';
import { Clock, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import './VisaCard.css';

const VisaCard = ({ type, description, processingTime, price, onApply }) => {
    return (
        <Card className="visa-card">
            <div className="visa-header">
                <h3 className="visa-title">{type}</h3>
                <span className="visa-price">{price}</span>
            </div>
            <p className="visa-desc">{description}</p>

            <div className="visa-meta">
                <div className="meta-item">
                    <Clock size={16} />
                    <span>Processing: {processingTime}</span>
                </div>
                <div className="meta-item text-accent">
                    <Check size={16} />
                    <span>Assistance Available</span>
                </div>
            </div>

            <Button onClick={onApply} className="btn-full">Apply Now</Button>
        </Card>
    );
};

export default VisaCard;
