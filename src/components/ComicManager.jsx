import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CharacterManager = ({ onCharacterSelect, selectedCharacters }) => {
    const [characters, setCharacters] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newCharacter, setNewCharacter] = useState({ name: '', description: '', relationship: '' });

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const response = await api.get('/characters/');
            setCharacters(response.data);
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    };

    const handleCreateCharacter = async () => {
        try {
            await api.post('/characters/', newCharacter);
            setNewCharacter({ name: '', description: '', relationship: '' });
            setShowForm(false);
            fetchCharacters();
        } catch (error) {
            console.error('Error creating character:', error);
        }
    };

    return (
        <div className="character-manager">
            <h3>Characters</h3>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Add New Character'}
            </button>

            {showForm && (
                <div className="character-form">
                    <input
                        placeholder="Name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    />
                    <input
                        placeholder="Relationship"
                        value={newCharacter.relationship}
                        onChange={(e) => setNewCharacter({ ...newCharacter, relationship: e.target.value })}
                    />
                    <textarea
                        placeholder="Description"
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                    />
                    <button onClick={handleCreateCharacter}>Create Character</button>
                </div>
            )}

            <div className="characters-list">
                {characters.map(character => (
                    <div
                        key={character.id}
                        className={`character-item ${selectedCharacters.includes(character.id) ? 'selected' : ''}`}
                        onClick={() => onCharacterSelect(character.id)}
                    >
                        <h4>{character.name}</h4>
                        <p>{character.relationship}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharacterManager;