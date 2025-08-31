import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation after the component mounts
        setAnimate(true);
    }, []);

    const handleStartJournal = () => {
        navigate('/dashboard');
    };

    return (
        <div className={`landing-container ${animate ? 'in-view' : ''}`}>
            <header className="landing-header">
                <h1>Unlock Your Story.</h1>
                <p>Your daily reflections, transformed into a personal comic series.</p>
            </header>
            <main className="landing-main">
                <div className="cta-card">
                    <h2>Ready to Begin?</h2>
                    <p>Start your first journal entry and watch your memories come to life.</p>
                    <button onClick={handleStartJournal} className="cta-button">
                        Start Your First Entry
                    </button>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
