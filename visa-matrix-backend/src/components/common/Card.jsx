import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hoverable = false, ...props }) => {
    return (
        <div
            className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
