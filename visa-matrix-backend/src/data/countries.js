export const COUNTRIES_DATA = [
    {
        id: '1',
        name: 'United States',
        slug: 'united-states',
        country_code: 'US',
        flag_image: '🇺🇸', // Using emoji for now as requested/placeholder, can be replaced with image URL later
        hero_image: '/images/hero-us.jpg', // Placeholder path
        short_description: 'Expert guidance for B1/B2 Tourist, F1 Student, and H1B Work visas.',
        visa_types: [
            'Tourist (B1/B2)',
            'Student (F1)',
            'Work (H1B)',
            'Business (B1)'
        ],
        processing_time: '3 - 8 weeks typically',
        is_active: true,
        bg_color: 'from-blue-900 to-blue-800' // Custom gradient hint if needed
    },
    {
        id: '2',
        name: 'United Kingdom',
        slug: 'united-kingdom',
        country_code: 'GB',
        flag_image: '🇬🇧',
        hero_image: '/images/hero-uk.jpg',
        short_description: 'Fast track services for UK Standard Visitor and Student visas.',
        visa_types: [
            'Standard Visitor',
            'Student Visa',
            'Skilled Worker'
        ],
        processing_time: '15 working days (Standard)',
        is_active: true
    },
    {
        id: '3',
        name: 'Canada',
        slug: 'canada',
        country_code: 'CA',
        flag_image: '🇨🇦',
        hero_image: '/images/hero-ca.jpg',
        short_description: 'Simplify your journey to Canada with our visitor and super visa services.',
        visa_types: [
            'Visitor Visa',
            'Super Visa',
            'Study Permit'
        ],
        processing_time: '20 - 45 days',
        is_active: true
    },
    {
        id: '4',
        name: 'Australia',
        slug: 'australia',
        country_code: 'AU',
        flag_image: '🇦🇺',
        hero_image: '/images/hero-au.jpg',
        short_description: 'Comprehensive support for Tourist streams and Student visas.',
        visa_types: [
            'Visitor (Subclass 600)',
            'Student (Subclass 500)'
        ],
        processing_time: '15 - 30 days',
        is_active: true
    },
    {
        id: '5',
        name: 'Schengen Area',
        slug: 'schengen',
        country_code: 'EU',
        flag_image: '🇪🇺',
        hero_image: '/images/hero-eu.jpg',
        short_description: 'One visa for 27 European countries. Expert guidance for swift approval.',
        visa_types: [
            'Tourist Type C',
            'Business Type C'
        ],
        processing_time: '15 calendar days',
        is_active: true
    }
];

export const getAllCountries = () => {
    return COUNTRIES_DATA.filter(country => country.is_active);
};

export const getCountryBySlug = (slug) => {
    return COUNTRIES_DATA.find(country => country.slug === slug);
};
