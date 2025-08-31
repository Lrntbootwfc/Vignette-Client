// src/pages/JournalPage.jsx
import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../services/api';
import './JournalPage.css'; // We'll create this CSS file next

const JournalPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState(null);
    const [editorState, setEditorState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const response = await api.get(`/journal-entries/journal-entries/${id}/`);
                setJournal(response.data);
                const initialEditorState = response.data.content ? JSON.parse(response.data.content) : null;
                setEditorState(initialEditorState);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch journal:", err);
                setError("Failed to load journal entry.");
                setLoading(false);
            }
        };
        if (id) {
            fetchJournal();
        }
    }, [id]);
    const handleBack = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return <div className="loading-state">Loading journal...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="journal-page-container">
            <header className="journal-page-header">
                <button onClick={handleBack} className="back-button">Back to Dashboard</button>
                <h1>{journal.title}</h1>
            </header>
            <div className="journal-page-content">
                <LexicalComposer initialConfig={{
                    namespace: 'MyEditor',
                    onError: (e) => console.error(e),
                    editorState: editorState,
                }}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-class" />}
                        placeholder={<div className="placeholder">Start typing here...</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </LexicalComposer>
                <p className="journal-date">Created on: {new Date(journal.date_created).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default JournalPage;