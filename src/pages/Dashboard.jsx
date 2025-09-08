import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot } from 'lexical';
import './Dashboard.css';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [editorState, setEditorState] = useState(null);
    const [journals, setJournals] = useState([]);
    const [gamificationData, setGamificationData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const [workingEndpoint, setWorkingEndpoint] = useState(null);
    const [generatingComic, setGeneratingComic] = useState(false);
    const [characterId, setCharacterId] = useState(null);
    const [characters, setCharacters] = useState([]);




    // Function to convert Lexical JSON to HTML
    const convertLexicalToHtml = (lexicalData) => {
        if (!lexicalData) return '<p>No content</p>';

        try {
            const parsedData = typeof lexicalData === 'string' ? JSON.parse(lexicalData) : lexicalData;

            if (!parsedData.root || !parsedData.root.children) return '<p>No content</p>';

            const convertNode = (node) => {
                if (node.type === 'text') {
                    return node.text || '';
                } else if (node.type === 'paragraph') {
                    const content = node.children ? node.children.map(convertNode).join('') : '';
                    return `<p>${content}</p>`;
                } else if (node.type === 'heading' && node.tag) {
                    const content = node.children ? node.children.map(convertNode).join('') : '';
                    return `<${node.tag}>${content}</${node.tag}>`;
                } else if (node.type === 'list' && node.listType === 'bullet') {
                    const items = node.children ? node.children.map(child =>
                        `<li>${child.children ? child.children.map(convertNode).join('') : ''}</li>`
                    ).join('') : '';
                    return `<ul>${items}</ul>`;
                } else if (node.type === 'list' && node.listType === 'number') {
                    const items = node.children ? node.children.map(child =>
                        `<li>${child.children ? child.children.map(convertNode).join('') : ''}</li>`
                    ).join('') : '';
                    return `<ol>${items}</ol>`;
                } else if (node.children) {
                    return node.children.map(convertNode).join('');
                }
                return '';
            };

            const htmlContent = parsedData.root.children.map(convertNode).join('');
            return htmlContent || '<p>No content</p>';
        } catch (e) {
            console.error('Error converting Lexical to HTML:', e);
            return '<p>Error displaying content</p>';
        }
    };

    const getHtmlFromLexical = (lexicalData) => {
        return { __html: convertLexicalToHtml(lexicalData) };
    };

    // Function to handle comic generation
    const handleGenerateComic = async (journalId) => {
        setGeneratingComic(true);
        try {
            const response = await api.post(
                `/journal-entries/${journalId}/create-comic/`,
                { character_id: characterId }   // required by backend
            );
            console.log('Comic generation initiated:', response.data);

            setJournals(prevJournals =>
                prevJournals.map(journal =>
                    journal.id === journalId
                        ? { ...journal, comic_entry: response.data } // update comic_entry for this journal
                        : journal
                )
            );

            // try {
            //     const journalEndpoints = [
            //         '/journal-entries/',
            //         '/journals/',
            //         '/api/journal-entries/',
            //         '/api/journals/'
            //     ];

            //     for (const endpoint of journalEndpoints) {
            //         try {
            //             const journalsResponse = await api.get(endpoint);
            //             setJournals(journalsResponse.data.results || journalsResponse.data || []);
            //             break;
            //         } catch (endpointError) {
            //             continue;
            //         }
            //     }
            // } catch (refreshError) {
            //     console.log('Could not refresh journals after comic generation');
            // }


        } catch (err) {
            console.error('Failed to generate comic:', err);
            setError('Failed to generate comic. Please try again.');
        } finally {
            setGeneratingComic(false);
        }
    };

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await api.get('/characters/');
                setCharacters(res.data || []);
            } catch (err) {
                console.error('Failed to load characters:', err);
            }
        };
        fetchCharacters();
    }, []);





    useEffect(() => {
        const fetchData = async () => {
            // NEW: Multiple endpoint fallback system for better error handling
            try {
                setLoading(true);

                // Try multiple possible endpoints for journal entries
                let journalsData = [];
                let journalsLoaded = false;

                try {
                    const journalsResponse = await api.get('journal-entries/');
                    journalsData = journalsResponse.data.results || journalsResponse.data || [];
                    journalsLoaded = true;
                    console.log(`✅ Successfully loaded from: ${endpoint}`);

                } catch (endpointError) {
                    // Silently continue to next endpoint

                }


                if (!journalsLoaded) {
                    // If all endpoints fail, set empty array and show a more specific error
                    console.log('All journal endpoints failed, setting empty array');
                    journalsData = [];
                }

                setJournals(journalsData);

                try {
                    const gamificationResponse = await api.get('/gamification/streaks/');
                    if (gamificationResponse.data.length > 0) {
                        setGamificationData(gamificationResponse.data[0]);
                    }
                } catch (gamificationError) {
                    console.log('Gamification data not available:', gamificationError);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                // NEW: More helpful error message
                setError('Failed to load data. The server may be experiencing issues. You can still create new entries.');
            } finally {
                setLoading(false);
                setIsEditorLoaded(true);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        console.log('Journals data:', journals);
        if (journals.length > 0) {
            console.log('First journal structure:', journals[0]);
            console.log('First journal content:', journals[0].content);
        }
    }, [journals]);

    const handleSave = async () => {
        // Validate before saving
        if (!editorState) {
            setError('Please write some content before saving.');
            return;
        }

        // Check if editor has actual content
        const isEmpty = editorState.read(() => {
            const root = $getRoot();
            const textContent = root.getTextContent().trim();
            return textContent.length === 0;
        });

        if (isEmpty && !title.trim()) {
            setError('Please add a title or content before saving.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const editorStateJSON = editorState.toJSON();
            const newEntry = {
                title: title.trim() || 'Untitled Entry',
                content: JSON.stringify(editorStateJSON),
            };

            console.log('Saving entry:', newEntry); // Debug log

            // Try different possible endpoints based on common Django REST patterns
            const endpointsToTry = [
                '/journal-entries/',
                '/journal-entries/create/',
                '/journal-entries/add/',
                '/journal-entry/',
                '/journals/',
                '/journal/',
            ];

            let saved = false;
            for (const endpoint of endpointsToTry) {
                try {
                    await api.post(endpoint, newEntry);
                    saved = true;
                    setWorkingEndpoint(endpoint);
                    console.log(`Successfully saved using endpoint: ${endpoint}`);
                    break;
                } catch (endpointError) {
                    console.log(`Failed with endpoint ${endpoint}:`, endpointError.response?.status);
                    continue;
                }
            }

            if (!saved) {
                throw new Error('Could not find a working endpoint for saving');
            }

            // Clear the form after successful save
            setEditorState(null);
            setTitle('');

            // NEW: Better error handling for journal refresh after saving
            try {
                const journalEndpoints = [
                    '/journal-entries/',
                    '/journals/',
                    '/api/journal-entries/',
                    '/api/journals/'
                ];

                for (const endpoint of journalEndpoints) {
                    try {
                        const journalsResponse = await api.get(endpoint);
                        setJournals(journalsResponse.data.results || journalsResponse.data || []);
                        break;
                    } catch (endpointError) {
                        continue;
                    }
                }
            } catch (refreshError) {
                console.log('Could not refresh journals list');
            }

            console.log('Entry saved successfully'); // Debug log

        } catch (err) {
            console.error('Failed to save journal:', err);

            // More specific error handling
            if (err.response) {
                // Server responded with error status
                const errorMessage = err.response.data?.message || err.response.data?.detail || 'Server error occurred';
                setError(`Failed to save: ${errorMessage} (Status: ${err.response.status})`);
            } else if (err.request) {
                // Request made but no response
                setError('No response from server. Please check your connection.');
            } else {
                // Something else happened
                setError('An unexpected error occurred while saving.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading user data...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome to your Comic Diary</h1>
                {gamificationData?.current_streak !== undefined && (
                    <p>Current Streak: {gamificationData.current_streak} days</p>
                )}
            </header>

            {error && (
                <div className="error-message" style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
                    {error}
                    <button
                        onClick={() => setError(null)}
                        style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>
            )}

            <main className="dashboard-main">
                <div className="editor-section">
                    <input
                        type="text"
                        placeholder="Journal Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input"
                    />
                    <div className="rich-text-editor-container">
                        {isEditorLoaded && (
                            <LexicalComposer
                                initialConfig={{
                                    namespace: 'MyEditor',
                                    onError: (error) => {
                                        console.error('Lexical Error:', error);
                                        setError('Editor error occurred. Please refresh the page.');
                                    },
                                    editorState: null,
                                }}
                                key="lexical-editor"
                            >
                                <RichTextPlugin
                                    contentEditable={<ContentEditable className="editor-class" />}
                                    placeholder={<div className="placeholder">Start typing here...</div>}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                                <HistoryPlugin />
                                <OnChangePlugin
                                    onChange={(editorState) => {
                                        setEditorState(editorState);
                                        // Clear any previous errors when user starts typing
                                        if (error && error.includes('content before saving')) {
                                            setError(null);
                                        }
                                    }}
                                />
                            </LexicalComposer>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={handleSave}
                            className="save-button"
                            disabled={saving || !isEditorLoaded}
                        >
                            {saving ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>

                <div className="journals-list-section">
                    <h2>Your Journals</h2>
                    {/* Debug info */}
                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                        <strong>Debug:</strong> Found {journals.length} journal entries
                        {journals.length > 0 && (
                            <details style={{ marginTop: '5px' }}>
                                <summary>Show journal data</summary>
                                <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
                                    {JSON.stringify(journals, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div className="journals-list">
                        {journals.length > 0 ? (
                            journals.map((journal) => (
                                <div key={journal.id} className="journal-entry-card">
                                    <Link to={`/journal/${journal.id}`} className="journal-link">
                                        <h3>{journal.title || 'Untitled Entry'}</h3>
                                        <div dangerouslySetInnerHTML={getHtmlFromLexical(journal.content)} />
                                        <p>Date: {journal.date_created ? new Date(journal.date_created).toLocaleDateString() : 'No date'}</p>
                                    </Link>

                                    {/* <select
                                        value={characterId || ''}
                                        onChange={(e) => setCharacterId(e.target.value)}
                                        style={{ marginTop: '10px', padding: '5px' }}
                                    >
                                        <option value="" disabled>Select Character</option>
                                        {characters.map((char) => (
                                            <option key={char.id} value={char.id}>{char.name}</option>
                                        ))}
                                    </select> */}


                                    {/* Add comic generation button - outside the Link to prevent navigation */}
                                    {/* {journal && (!journal.comic_entry || journal.comic_entry === null || journal.comic_entry === false) && ( */}
                                    {!journal.comic_entry
                                        && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!characterId) {
                                                        setError('Please select a character before generating comic.');
                                                        return;
                                                    }
                                                    handleGenerateComic(journal.id);
                                                }}
                                                disabled={generatingComic}
                                                className="comic-generate-button"
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '8px 16px',
                                                    backgroundColor: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {generatingComic ? 'Generating...' : 'Make Comic'}
                                            </button>
                                        )}

                                    {/* Debug info for individual entries */}
                                    <details style={{ fontSize: '10px', marginTop: '5px' }}>
                                        <summary>Debug this entry</summary>
                                        <pre style={{ fontSize: '9px' }}>{JSON.stringify(journal, null, 2)}</pre>
                                    </details>
                                </div>
                            ))
                        ) : (
                            <p>No journal entries yet. Start writing one above!</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;