import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

const Stepper = ({ steps, currentStep }) => {
    return (
        <div className="stepper-container">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <React.Fragment key={index}>
                        <div
                            className={`stepper-item ${
                                isActive ? 'active' : ''
                            } ${isCompleted ? 'completed' : ''}`}
                        >
                            <div className="step-circle">
                                {isCompleted ? <Check size={16} /> : <span>{index + 1}</span>}
                            </div>
                            <span className="step-label">
                                {step}
                            </span>
                        </div>

                        {/* Draw line ONLY between steps */}
                        {index < steps.length - 1 && (
                            <div className="step-line" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Stepper;
