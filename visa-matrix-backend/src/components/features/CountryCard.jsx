import Button from '../common/Button';
import './CountryCard.css';

const CountryCard = ({ code, name, description }) => {
    return (
        <div className="country-card">
            <div className="country-code">{code}</div>
            <div className="country-name">{name}</div>
            <div className="country-desc">{description}</div>
            <Button size="sm">View Visa Options</Button>
        </div>
    );
};

export default CountryCard;
