// src/components/ComicGenerator.jsx
import React, { useState } from 'react';
import { createComic } from '../services/comicApi';
import ComicDisplay from './ComicDisplay';

// Predefined characters for the gallery.
// In a real application, these would be fetched from the backend.
const characters = [
    { id: 1, name: "Cartoon Cat", image_url: "https://placehold.co/100x100/A051A4/white?text=Cat" },
    { id: 2, name: "Mystic Wizard", image_url: "https://placehold.co/100x100/F5C04A/white?text=Wizard" },
    { id: 3, name: "Space Adventurer", image_url: "https://placehold.co/100x100/1296F0/white?text=Space" },
];

const ComicGenerator = ({ journalEntryId }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [comic, setComic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
                                    <img src={char.image_url} alt={char.name} />
                                    <p>{char.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Relationship Mapping (Placeholder) */}
                    {selectedCharacter && (
                        <div className="relationship-mapping-section">
                            <h4>2. Relationship Mapping</h4>
                            <p>The selected character, **{selectedCharacter.name}**, will represent your persona in the comic. More complex mapping features will be added later.</p>
                        </div>
                    )}

                    {/* "Create Comic" Button */}
                    <button
                        onClick={handleCreateComic}
                        disabled={!selectedCharacter || isLoading}
                        className="create-comic-button"
                    >
                        {isLoading ? 'Generating Comic...' : 'Generate Comic'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </>
            )}
        </div>
    );
};

export default ComicGenerator;