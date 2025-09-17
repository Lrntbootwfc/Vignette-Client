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
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const [savedEntryId, setSavedEntryId] = useState(null);

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
        try {
            setGeneratingComic(true);
            const response = await api.post(
                `/journal-entries/${journalId}/create-comic/`,
                { character_id: characterId }
            );
            console.log('Comic generation initiated:', response.data);

            setJournals(prevJournals =>
                prevJournals.map(journal =>
                    journal.id === journalId
                        ? { ...journal, comic_entry: response.data }
                        : journal
                )
            );
        } catch (err) {
            console.error('Failed to generate comic:', err);
            setError('Failed to generate comic. Please try again.');
        } finally {
            setGeneratingComic(false);
        }
    };

    // Function to navigate to comic creation
    const handleComicCreation = () => {
        navigate('/comic-creation');
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
            try {
                setLoading(true);

                let journalsData = [];
                let journalsLoaded = false;

                try {
                    const journalsResponse = await api.get('journal-entries/');
                    journalsData = journalsResponse.data.results || journalsResponse.data || [];
                    journalsLoaded = true;
                } catch (endpointError) {
                    console.log('Journal endpoint failed');
                }

                if (!journalsLoaded) {
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
        if (!editorState) {
            setError('Please write some content before saving.');
            return;
        }

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
            const editorRootText = editorState.read(() => {
                const root = $getRoot();
                const firstChild = root.getFirstChild();
                return firstChild && firstChild.getTextContent ? firstChild.getTextContent().trim() : '';
            });

            const newEntry = {
                title: title.trim() || editorRootText || 'Untitled Entry',
                content: JSON.stringify(editorStateJSON),
            };

            console.log('Saving entry:', newEntry);

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
                    const response = await api.post(endpoint, newEntry);
                    if (response.data?.id) {
                        setSavedEntryId(response.data.id);
                    }
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

            setEditorState(null);
            setTitle('');

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

            console.log('Entry saved successfully');
        } catch (err) {
            console.error('Failed to save journal:', err);

            if (err.response) {
                const errorMessage = err.response.data?.message || err.response.data?.detail || 'Server error occurred';
                setError(`Failed to save: ${errorMessage} (Status: ${err.response.status})`);
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
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

                                        editorState.read(() => {
                                            const root = $getRoot();
                                            const firstChild = root.getFirstChild();
                                            if (firstChild && firstChild.getTextContent) {
                                                const firstLine = firstChild.getTextContent().trim();
                                                if (firstLine) setTitle(firstLine);
                                            }
                                        });

                                        if (error && error.includes('content before saving')) {
                                            setError(null);
                                        }
                                    }}
                                />
                            </LexicalComposer>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleSave}
                            className="save-button"
                            disabled={saving || !isEditorLoaded}
                        >
                            {saving ? 'Saving...' : 'Save Entry'}
                        </button>

                        <button
                            onClick={handleComicCreation}
                            className="comic-creation-button"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5252'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b6b'}
                        >
                            Comic Creation
                        </button>

                        {savedEntryId && (
                            <button
                                onClick={() => handleGenerateComic(savedEntryId)}
                                className="generate-comic-button"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4ecdc4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#3db9b1'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#4ecdc4'}
                            >
                                Generate Comic
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;