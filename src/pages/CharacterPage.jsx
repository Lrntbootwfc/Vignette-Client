import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CharacterPage.css';

const CharactersPage = () => {
    const [characters, setCharacters] = useState([]);
    const [mappings, setMappings] = useState({});
    const [relationships, setRelationships] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadingImages, setUploadingImages] = useState({});
    const [genders, setGenders] = useState({});
    const [ages, setAges] = useState({});

    // Predefined comic-style characters organized by age groups
    const ageGroupCharacters = {
        children: [
            {
                id: 1,
                name: "Young Hero",
                image: "https://placehold.co/200x300/ff6b6b/white?text=Child+Hero",
                description: "Brave and courageous young protagonist",
                defaultGender: "Male",
                defaultAge: "Child"
            },
            {
                id: 2,
                name: "Classmate",
                image: "https://placehold.co/200x300/4ecdc4/white?text=Classmate",
                description: "School friend and companion",
                defaultGender: "Female",
                defaultAge: "Child"
            }
        ],
        teens: [
            {
                id: 3,
                name: "Teen Hero",
                image: "https://placehold.co/200x300/45b7d1/white?text=Teen+Hero",
                description: "Adventurous teenage protagonist",
                defaultGender: "Male",
                defaultAge: "Teen"
            },
            {
                id: 4,
                name: "Best Friend",
                image: "https://placehold.co/200x300/f9ca24/white?text=Best+Friend",
                description: "Loyal companion through thick and thin",
                defaultGender: "Female",
                defaultAge: "Teen"
            },
            {
                id: 5,
                name: "School Rival",
                image: "https://placehold.co/200x300/6c5ce7/white?text=School+Rival",
                description: "Competitive classmate",
                defaultGender: "Male",
                defaultAge: "Teen"
            },
            {
                id: 6,
                name: "Crush",
                image: "https://placehold.co/200x300/e84393/white?text=Crush",
                description: "Secret admiration",
                defaultGender: "Female",
                defaultAge: "Teen"
            }
        ],
        youngAdults: [
            {
                id: 7,
                name: "College Friend",
                image: "https://placehold.co/200x300/00b894/white?text=College+Friend",
                description: "University companion",
                defaultGender: "Male",
                defaultAge: "Young Adult"
            },
            {
                id: 8,
                name: "Mentor",
                image: "https://placehold.co/200x300/0984e3/white?text=Mentor",
                description: "Guiding figure",
                defaultGender: "Female",
                defaultAge: "Young Adult"
            },
            {
                id: 9,
                name: "Roommate",
                image: "https://placehold.co/200x300/d63031/white?text=Roommate",
                description: "Shared living companion",
                defaultGender: "Non-binary",
                defaultAge: "Young Adult"
            }
        ],
        adults: [
            {
                id: 10,
                name: "Work Colleague",
                image: "https://placehold.co/200x300/fdcb6e/white?text=Work+Colleague",
                description: "Professional associate",
                defaultGender: "Male",
                defaultAge: "Adult"
            },
            {
                id: 11,
                name: "Partner",
                image: "https://placehold.co/200x300/ff7675/white?text=Partner",
                description: "Life companion",
                defaultGender: "Female",
                defaultAge: "Adult"
            },
            {
                id: 12,
                name: "Boss",
                image: "https://placehold.co/200x300/74b9ff/white?text=Boss",
                description: "Supervisor at work",
                defaultGender: "Male",
                defaultAge: "Adult"
            }
        ],
        middleAged: [
            {
                id: 13,
                name: "Parent",
                image: "https://placehold.co/200x300/55efc4/white?text=Parent",
                description: "Nurturing family member",
                defaultGender: "Female",
                defaultAge: "Middle-aged"
            },
            {
                id: 14,
                name: "Family Friend",
                image: "https://placehold.co/200x300/a29bfe/white?text=Family+Friend",
                description: "Long-time family acquaintance",
                defaultGender: "Male",
                defaultAge: "Middle-aged"
            },
            {
                id: 15,
                name: "Relative",
                image: "https://placehold.co/200x300/ffeaa7/white?text=Relative",
                description: "Extended family member",
                defaultGender: "Female",
                defaultAge: "Middle-aged"
            }
        ],
        elders: [
            {
                id: 16,
                name: "Grandparent",
                image: "https://placehold.co/200x300/fdcb6e/white?text=Grandparent",
                description: "Wise elder family member",
                defaultGender: "Female",
                defaultAge: "Elder"
            },
            {
                id: 17,
                name: "Family Elder",
                image: "https://placehold.co/200x300/e17055/white?text=Family+Elder",
                description: "Respected senior family member",
                defaultGender: "Male",
                defaultAge: "Elder"
            },
            {
                id: 18,
                name: "Neighbor",
                image: "https://placehold.co/200x300/00cec9/white?text=Neighbor",
                description: "Friendly local resident",
                defaultGender: "Female",
                defaultAge: "Elder"
            }
        ]
    };

    // Combine all characters into one array
    const allCharacters = [
        ...ageGroupCharacters.children,
        ...ageGroupCharacters.teens,
        ...ageGroupCharacters.youngAdults,
        ...ageGroupCharacters.adults,
        ...ageGroupCharacters.middleAged,
        ...ageGroupCharacters.elders
    ];

    // Relationship options
    const relationshipOptions = [
        "Myself", "Parent", "Sibling", "Partner", "Friend", 
        "Colleague", "Mentor", "Child", "Relative", "Teacher",
        "Classmate", "Neighbor", "Other"
    ];

    // Gender options
    const genderOptions = ["Male", "Female", "Non-binary", "Other"];

    // Age group options
    const ageOptions = ["Child", "Teen", "Young Adult", "Adult", "Middle-aged", "Elder"];

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const res = await api.get('/characters/');
            // Use API characters if available, otherwise use defaults
            if (res.data && res.data.length > 0) {
                setCharacters(res.data);
                
                // Initialize gender and age states from API data
                const initialGenders = {};
                const initialAges = {};
                
                res.data.forEach(char => {
                    initialGenders[char.id] = char.defaultGender || "Other";
                    initialAges[char.id] = char.defaultAge || "Adult";
                });
                
                setGenders(initialGenders);
                setAges(initialAges);
            } else {
                setCharacters(allCharacters);
                
                // Initialize gender and age states from default data
                const initialGenders = {};
                const initialAges = {};
                
                allCharacters.forEach(char => {
                    initialGenders[char.id] = char.defaultGender;
                    initialAges[char.id] = char.defaultAge;
                });
                
                setGenders(initialGenders);
                setAges(initialAges);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch characters:', err);
            // Use default characters if API fails
            setCharacters(allCharacters);
            
            // Initialize gender and age states from default data
            const initialGenders = {};
            const initialAges = {};
            
            allCharacters.forEach(char => {
                initialGenders[char.id] = char.defaultGender;
                initialAges[char.id] = char.defaultAge;
            });
            
            setGenders(initialGenders);
            setAges(initialAges);
            setLoading(false);
        }
    };

    const handleMappingChange = (charId, realName) => {
        setMappings(prev => ({ ...prev, [charId]: realName }));
    };

    const handleRelationshipChange = (charId, relationship) => {
        setRelationships(prev => ({ ...prev, [charId]: relationship }));
    };

    const handleGenderChange = (charId, gender) => {
        setGenders(prev => ({ ...prev, [charId]: gender }));
    };

    const handleAgeChange = (charId, age) => {
        setAges(prev => ({ ...prev, [charId]: age }));
    };

    const handleImageUpload = async (charId, event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            setError('Please upload an image file');
            return;
        }
        
        setUploadingImages(prev => ({ ...prev, [charId]: true }));
        
        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('image', file);
            formData.append('character_id', charId);
            
            // Upload image to backend
            const response = await api.post('/upload-character-image/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // If successful, update character with new image
            if (response.data.image_url) {
                setCharacters(prev => prev.map(char => 
                    char.id === charId ? { ...char, image: response.data.image_url } : char
                ));
                
                setSuccessMessage('Image uploaded successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            console.error('Failed to upload image:', err);
            setError('Could not upload image. Please try again.');
        } finally {
            setUploadingImages(prev => ({ ...prev, [charId]: false }));
        }
    };

    const handleSaveMappings = async () => {
        try {
            setError(null);
            setSuccessMessage('');
            
            for (const charId in mappings) {
                if (mappings[charId] && mappings[charId].trim() !== '') {
                    const payload = {
                        character: charId,
                        real_life_name: mappings[charId],
                        relationship: relationships[charId] || 'Other',
                        gender: genders[charId] || 'Other',
                        age_group: ages[charId] || 'Adult'
                    };
                    await api.post('/user-characters/', payload);
                }
            }
            
            setSuccessMessage('Character mappings saved successfully!');
            
            // Clear form after successful save
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (err) {
            console.error('Failed to save mappings:', err);
            setError('Could not save mappings. Please try again.');
        }
    };

    const applyComicFilter = (imageUrl) => {
        // This would typically be done with CSS filters
        return imageUrl;
    };

    if (loading) return (
        <div className="loading-container">
            <div className="comic-loader"></div>
            <p>Loading characters...</p>
        </div>
    );

    return (
        <div className="characters-page-container">
            <div className="comic-header">
                <h1>Map Your Comic Characters</h1>
                <p>Assign characters to people in your life and customize their details</p>
                <div className="image-instruction">
                    <p>💡 <strong>Add your own images:</strong> Replace the placeholder images with your own by clicking the "Upload Image" button on each character card.</p>
                    <p>For best comic results, use black and white images with clear facial features.</p>
                </div>
            </div>
            
            {error && (
                <div className="error-message comic-alert">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}
            
            {successMessage && (
                <div className="success-message comic-alert">
                    <span>{successMessage}</span>
                </div>
            )}
            
            {/* Children Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Children (5-12 years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Child").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            {/* Teens Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Teens (13-19 years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Teen").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            {/* Young Adults Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Young Adults (20-35 years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Young Adult").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            {/* Adults Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Adults (36-50 years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Adult").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            {/* Middle-aged Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Middle-aged (51-65 years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Middle-aged").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            {/* Elders Age Group */}
            <div className="age-group-section">
                <h2 className="age-group-title">Elders (66+ years)</h2>
                <div className="characters-grid">
                    {characters.filter(char => char.defaultAge === "Elder").map(char => (
                        <CharacterCard 
                            key={char.id}
                            char={char}
                            mappings={mappings}
                            relationships={relationships}
                            genders={genders}
                            ages={ages}
                            uploadingImages={uploadingImages}
                            handleMappingChange={handleMappingChange}
                            handleRelationshipChange={handleRelationshipChange}
                            handleGenderChange={handleGenderChange}
                            handleAgeChange={handleAgeChange}
                            handleImageUpload={handleImageUpload}
                            relationshipOptions={relationshipOptions}
                            genderOptions={genderOptions}
                            ageOptions={ageOptions}
                        />
                    ))}
                </div>
            </div>
            
            <div className="save-container">
                <button onClick={handleSaveMappings} className="save-mappings-button comic-button">
                    Save All Mappings
                </button>
            </div>
        </div>
    );
};

// Character Card Component for better organization
const CharacterCard = ({ 
    char, 
    mappings, 
    relationships, 
    genders, 
    ages, 
    uploadingImages, 
    handleMappingChange, 
    handleRelationshipChange, 
    handleGenderChange, 
    handleAgeChange, 
    handleImageUpload,
    relationshipOptions,
    genderOptions,
    ageOptions
}) => {
    return (
        <div className="character-card comic-panel">
            <div className="character-image-container">
                <img 
                    src={char.image} 
                    alt={char.name} 
                    className="character-image comic-style" 
                />
                <div className="character-overlay">
                    <h3>{char.name}</h3>
                    <p>{char.description}</p>
                </div>
                
                <div className="image-upload-container">
                    <label className="image-upload-label">
                        {uploadingImages[char.id] ? 'Uploading...' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(char.id, e)}
                            style={{ display: 'none' }}
                            disabled={uploadingImages[char.id]}
                        />
                    </label>
                    <p className="upload-hint">Upload B/W image for best comic results</p>
                </div>
            </div>
            
            <div className="mapping-fields">
                <div className="input-group">
                    <label>Real Person's Name</label>
                    <input
                        type="text"
                        placeholder="Who is this character?"
                        value={mappings[char.id] || ''}
                        onChange={(e) => handleMappingChange(char.id, e.target.value)}
                    />
                </div>
                
                <div className="input-group">
                    <label>Your Relationship</label>
                    <select
                        value={relationships[char.id] || ''}
                        onChange={(e) => handleRelationshipChange(char.id, e.target.value)}
                    >
                        <option value="">Select relationship</option>
                        {relationshipOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                
                <div className="input-group">
                    <label>Gender</label>
                    <select
                        value={genders[char.id] || ''}
                        onChange={(e) => handleGenderChange(char.id, e.target.value)}
                    >
                        {genderOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                
                <div className="input-group">
                    <label>Age Group</label>
                    <select
                        value={ages[char.id] || ''}
                        onChange={(e) => handleAgeChange(char.id, e.target.value)}
                    >
                        {ageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CharactersPage;