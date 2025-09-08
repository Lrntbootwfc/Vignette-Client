import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CharacterManager from '../components/CharacterManager';
import FolderManager from '../components/FolderManager';

const EnhancedDashboard = () => {
    const [activeTab, setActiveTab] = useState('journals');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedCharacters, setSelectedCharacters] = useState([]);

    return (
        <div className="enhanced-dashboard">
            <header>
                <h1>Comic Diary</h1>
                <nav>
                    <button
                        className={activeTab === 'journals' ? 'active' : ''}
                        onClick={() => setActiveTab('journals')}
                    >
                        Journals
                    </button>
                    <button
                        className={activeTab === 'characters' ? 'active' : ''}
                        onClick={() => setActiveTab('characters')}
                    >
                        Characters
                    </button>
                    <button
                        className={activeTab === 'badges' ? 'active' : ''}
                        onClick={() => setActiveTab('badges')}
                    >
                        Badges
                    </button>
                </nav>
            </header>

            <div className="dashboard-content">
                {activeTab === 'journals' && (
                    <div className="journals-section">
                        <div className="sidebar">
                            <FolderManager
                                onFolderSelect={setSelectedFolder}
                                selectedFolder={selectedFolder}
                            />
                            <button className="new-entry-btn">
                                <Link to="/create-entry">+ New Entry</Link>
                            </button>
                        </div>
                        <div className="journals-list">
                            {/* Your existing journals list implementation */}
                            <h2>Your Journals</h2>
                            {/* Filter journals by selectedFolder */}
                        </div>
                    </div>
                )}

                {activeTab === 'characters' && (
                    <CharacterManager
                        onCharacterSelect={(charId) => {
                            setSelectedCharacters(prev =>
                                prev.includes(charId)
                                    ? prev.filter(id => id !== charId)
                                    : [...prev, charId]
                            );
                        }}
                        selectedCharacters={selectedCharacters}
                    />
                )}

                {activeTab === 'badges' && (
                    <div className="badges-section">
                        <h2>Your Achievements</h2>
                        {/* Badges display implementation */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedDashboard;