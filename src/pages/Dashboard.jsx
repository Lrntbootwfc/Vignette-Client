import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './Dashboard.css';
import api from '../services/api';

const Dashboard = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [journals, setJournals] = useState([]);
    const [gamificationData, setGamificationData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);

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
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const contentState = editorState.getCurrentContent();
            const htmlContent = draftToHtml(convertToRaw(contentState));

            // We need to pass the user ID from the login token
            const user = localStorage.getItem('user_id');
            if (!user) {
                setError("User not authenticated. Please log in.");
                setSaving(false);
                return;
            }

            const newEntry = {
                title: title || 'Untitled Entry',
                content: htmlContent,
                user: user // Sending the user ID with the request
            };

            await api.post('/journal-entries/journal-entries/', newEntry);

            // Clear the editor and title after saving
            setEditorState(EditorState.createEmpty());
            setTitle('');

            // Refresh the list of journals
            const journalsResponse = await api.get('/journal-entries/journal-entries/');
            setJournals(journalsResponse.data);

        } catch (err) {
            console.error('Failed to save journal:', err.response);
            setError('Failed to save journal entry.');
        } finally {
            setSaving(false);
        }
    };

    const getHtmlFromDraft = (rawContent) => {
        if (!rawContent) return { __html: '' };
        return { __html: draftToHtml(rawContent) };
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
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={setEditorState}
                            toolbarClassName="toolbar-class"
                            wrapperClassName="wrapper-class"
                            editorClassName="editor-class"
                            placeholder="Write your diary entry here..."
                        />
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
                                <div key={journal.id} className="journal-entry-card">
                                    <h3>{journal.title || 'Untitled Entry'}</h3>
                                    <div dangerouslySetInnerHTML={getHtmlFromDraft(journal.content)} />
                                    <p>Date: {new Date(journal.date_created).toLocaleDateString()}</p>
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
