import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
// import { ErrorBoundary as LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
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
    const [isEditorLoaded, setIsEditorLoaded] = useState(false); // Correctly declare the state here

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const journalsResponse = await api.get('/journal-entries/journal-entries/');
                setJournals(journalsResponse.data);

                const gamificationResponse = await api.get('/gamification/streaks/');
                if (gamificationResponse.data.length > 0) {
                    setGamificationData(gamificationResponse.data[0]);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please ensure you are logged in correctly.');
            } finally {
                setLoading(false);
                setIsEditorLoaded(true);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const editorStateJSON = editorState.toJSON();
            const newEntry = {
                title: title || 'Untitled Entry',
                content: JSON.stringify(editorStateJSON),
            };

            await api.post('/journal-entries/journal-entries/', newEntry);

            setEditorState(null);
            setTitle('');

            const journalsResponse = await api.get('/journal-entries/journal-entries/');
            setJournals(journalsResponse.data);

        } catch (err) {
            console.error('Failed to save journal:', err.response);
            setError('Failed to save journal entry. Please check your token or if you are logged in.');
        } finally {
            setSaving(false);
        }
    };
    const getHtmlFromDraft = (rawContent) => {
        if (!rawContent) {
            return { __html: '' };
        }
        return { __html: rawContent };
    };

    if (loading) {
        return <div className="loading-state">Loading user data...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome to your Comic Diary</h1>
                {gamificationData.current_streak !== undefined && (
                    <p>Current Streak: {gamificationData.current_streak} days</p>
                )}
            </header>
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
                        <LexicalComposer initialConfig={{
                            namespace: 'MyEditor',
                            onError: (e) => console.error(e),
                            editorState: null,
                        }}>
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="editor-class" />}
                                placeholder={<div className="placeholder">Start typing here...</div>}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <OnChangePlugin onChange={(editorState) => setEditorState(editorState)} />
                        </LexicalComposer>
                    </div>
                    <button onClick={handleSave} className="save-button" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>

                <div className="journals-list-section">
                    <h2>Your Journals</h2>
                    <div className="journals-list">
                        {journals.length > 0 ? (
                            journals.map((journal) => (
                                <Link to={`/journal/${journal.id}`} key={journal.id} className="journal-link">
                                    <div className="journal-entry-card">
                                        <h3>{journal.title || 'Untitled Entry'}</h3>
                                        <div dangerouslySetInnerHTML={getHtmlFromDraft(journal.content)} />
                                        <p>Date: {new Date(journal.date_created).toLocaleDateString()}</p>
                                    </div>
                                </Link>
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