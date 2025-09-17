import React, { useState, useEffect } from 'react';
import { createComic } from '../services/comicApi';
import ComicDisplay from './ComicDisplay';
import api from '../services/api';

const ComicGenerator = ({ journalEntryId }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [comic, setComic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [characters, setCharacters] = useState([]);

    // Fetch characters from backend
    useEffect(() => {
    const fetchCharacters = async () => {
        try {
            const res = await api.get('/characters/');
            const charactersData = res.data.results || res.data;

            // Fetch user mappings
            const mappingsRes = await api.get('/user-characters/');
            const mappings = {};
            mappingsRes.data.forEach(item => {
                mappings[item.character] = item.real_life_name;
            });

            // Merge mappings into characters
            const mergedCharacters = charactersData.map(char => ({
                ...char,
                relationship: mappings[char.id] || char.relationship || 'Not specified'
            }));

            setCharacters(mergedCharacters);
        } catch (err) {
            console.error('Error fetching characters or mappings:', err);
            // fallback defaults
            setCharacters([
                { id: 1, name: "Cartoon Cat", image_url: "https://placehold.co/100x100/A051A4/white?text=Cat", relationship: 'Not specified' },
                { id: 2, name: "Mystic Wizard", image_url: "https://placehold.co/100x100/F5C04A/white?text=Wizard", relationship: 'Not specified' },
                { id: 3, name: "Space Adventurer", image_url: "https://placehold.co/100x100/1296F0/white?text=Space", relationship: 'Not specified' },
            ]);
        }
    };
    fetchCharacters();
}, []);


    const handleCreateComic = async () => {
        if (!selectedCharacter) {
            setError('Please select a character first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setComic(null);

        try {
            const newComic = await createComic(journalEntryId, selectedCharacter.id);
            setComic(newComic);
            // Refresh the page to show the new comic
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create comic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="comic-generator-container">
            <h3>Create Your Comic</h3>
            {comic && <ComicDisplay comic={comic} />}
            {!comic && (
                <>
                    {/* Character Selection */}
                    <div className="character-selection-section">
                        <h4>1. Choose a Character</h4>
                        <div className="character-grid">
                            {characters.map(char => (
                                <div
                                    key={char.id}
                                    className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedCharacter(char)}
                                >
                                    <img src={char.image_url || char.avatar} alt={char.name} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                                    <p>{char.name}</p>
                                    {char.relationship && <small>{char.relationship}</small>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Relationship Mapping */}
                    {selectedCharacter && (
                        <div className="relationship-mapping-section">
                            <h4>2. Relationship: {selectedCharacter.relationship || 'Not specified'}</h4>
                            <p>{selectedCharacter.description || 'No description available.'}</p>
                        </div>
                    )}

                    {/* "Create Comic" Button */}
                    <button
                        onClick={handleCreateComic}
                        disabled={!selectedCharacter || isLoading}
                        className="create-comic-button"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        {isLoading ? 'Generating Comic...' : 'Generate Comic'}
                    </button>
                    {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
                </>
            )}
        </div>
    );
};

export default ComicGenerator;