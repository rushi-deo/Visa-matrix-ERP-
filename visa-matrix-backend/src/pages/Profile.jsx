import React from 'react';
import { User, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import './Profile.css';

const APPLICATIONS = [
    { id: 'APP-2023-001', country: 'United Kingdom', type: 'Tourist Visa', status: 'Approved', date: '2023-10-15' },
    { id: 'APP-2023-089', country: 'United States', type: 'Business Visa', status: 'Processing', date: '2024-01-05' },
    { id: 'APP-2024-012', country: 'Canada', type: 'Student Visa', status: 'Pending Documents', date: '2024-01-20' },
];

const Profile = () => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-accent';
            case 'Processing': return 'text-primary';
            case 'Pending Documents': return 'text-warning'; // Need to define warning color or use orange
            default: return 'text-muted';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} />;
            case 'Processing': return <Clock size={16} />;
            case 'Pending Documents': return <AlertCircle size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <Layout>
            <div className="container page-content">
                <h1 className="page-title">My Profile</h1>

                <div className="profile-grid">
                    {/* User Info Card */}
                    <Card className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <User size={32} />
                            </div>
                            <div className="profile-info">
                                <h3>John Doe</h3>
                                <p>john.doe@example.com</p>
                                <p>Member since 2023</p>
                            </div>
                        </div>
                    </Card>

                    {/* Applications List */}
                    <div className="applications-section">
                        <h2 className="section-heading">My Applications</h2>
                        <div className="applications-list">
                            {APPLICATIONS.map((app) => (
                                <Card key={app.id} className="app-item-card">
                                    <div className="app-header">
                                        <span className="app-id">{app.id}</span>
                                        <span className={`app-status ${getStatusColor(app.status)}`}>
                                            {getStatusIcon(app.status)} {app.status}
                                        </span>
                                    </div>
                                    <div className="app-details">
                                        <h3 className="app-country">{app.country}</h3>
                                        <p className="app-type">{app.type}</p>
                                        <p className="app-date">Applied on: {app.date}</p>
                                    </div>
                                    {/* Timeline Static UI */}
                                    <div className="app-timeline">
                                        <div className="timeline-track">
                                            <div className="timeline-fill" style={{
                                                width: app.status === 'Approved' ? '100%' : app.status === 'Processing' ? '60%' : '30%'
                                            }}></div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
