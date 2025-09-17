import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { FaUserCircle, FaFolder, FaMask, FaCog, FaBook } from 'react-icons/fa';
import api from '../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setAnimate(true);
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/folders/');
            
            // Ensure the response data is an array
            const foldersData = Array.isArray(response.data) ? response.data : [];
            setFolders(foldersData);
            
            console.log('Fetched folders:', foldersData);
        } catch (err) {
            console.error('Failed to fetch folders:', err);
            setError('Failed to load folders');
            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartJournal = () => {
        navigate('/dashboard');
    };

    const handleOpenFolder = (folderId) => {
        navigate(`/folders/${folderId}`);
    };
    
    const handleCharactersPage = () => {
        navigate('/characters');
    };

    const handleAllEntries = () => {
        navigate('/folders');
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    return (
        <div className={`landing-container ${animate ? 'in-view' : ''}`}>
            {/* Header */}
            <header className="landing-header">
                <h1 className="app-title">My Diary</h1>
                <div className="profile-section" onClick={toggleSettings}>
                    <FaUserCircle className="profile-icon" />
                    <span className="settings-text">Settings</span>
                </div>
            </header>

            {/* Settings Dropdown */}
            {showSettings && (
                <div className="settings-dropdown">
                    <div className="settings-item">Edit Profile</div>
                    <div className="settings-item">Account Settings</div>
                    <div className="settings-item">Privacy</div>
                    <div className="settings-item">Notifications</div>
                    <div className="settings-item">Help & Support</div>
                </div>
            )}

            {/* Main Sections */}
            <main className="landing-main">
                {/* Left Section - Folders and All Entries */}
                <section className="folder-list">
                    <h3>Your Folders</h3>
                    
                    {/* All Entries Box */}
                    <div 
                        className="all-entries-box"
                        onClick={handleAllEntries}
                    >
                        <FaBook className="entries-icon" />
                        <span className="entries-text">All Your Entries</span>
                    </div>
                    
                    {loading ? (
                        <p>Loading folders...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : !Array.isArray(folders) || folders.length === 0 ? (
                        <p>No folders yet</p>
                    ) : (
                        folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="folder-card"
                                style={{ borderLeft: `4px solid ${folder.color}` }}
                                onClick={() => handleOpenFolder(folder.id)}
                            >
                                <FaFolder className="folder-icon" />
                                <span className="folder-name">{folder.name}</span>
                                {folder.is_locked && <span className="lock-icon">🔒</span>}
                            </div>
                        ))
                    )}
                </section>

                {/* Center Section - New Entry */}
                <section className="new-entry">
                    <button onClick={handleStartJournal} className="new-entry-button">
                        New Entry
                    </button>

                    <button
                        onClick={handleCharactersPage}
                        className="characters-button"
                        style={{ marginTop: '15px', backgroundColor: '#6b5b95', color: 'white' }}
                    >
                        Map Characters <FaMask style={{ marginLeft: '8px' }} />
                    </button>
                </section>

                {/* Right Section - Gamification */}
                <section className="badges-section">
                    <h3>Gamification Badges</h3>
                    <div className="badge">🏅 First Entry</div>
                    <div className="badge">🔥 Daily Streak</div>
                    <div className="badge">✍️ Creative Writing</div>
                </section>
            </main>

            {/* How to Use Section */}
            <section className="how-to-use">
                <h2>How to Use</h2>
                <ol>
                    <li>Click <strong>New Entry</strong> to start writing.</li>
                    <li>Track your progress with badges.</li>
                    <li>Explore your past entries.</li>
                </ol>
            </section>
        </div>
    );
};

export default LandingPage;