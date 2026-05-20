import React from 'react';
import { Clock, Tag } from 'lucide-react';
import './VisaFeeCard.css';

const VisaFeeCard = ({ visa, isSelected, onSelect }) => {
    return (
        <div
            className={`visa-fee-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(visa)}
        >
            <div className="visa-fee-header">
                <h3>{visa.visa_type}</h3>
                {isSelected && <div className="selected-badge">Selected</div>}
            </div>

            <div className="visa-fee-amount">
                <span className="currency">$</span>
                <span className="amount">{visa.fee_amount}</span>
            </div>

            <div className="visa-fee-details">
                <div className="detail-item">
                    <Clock size={16} />
                    <span>{visa.processing_days} Days Processing</span>
                </div>
            </div>
        </div>
    );
};

export default VisaFeeCard;
