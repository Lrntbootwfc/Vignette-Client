import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../services/api';
import './JournalPage.css'; // We'll create this CSS file next
import ComicGenerator from '../components/ComicGenerator';

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
                const response = await api.get(`/journal-entries/${id}/`);
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

    // Function to convert Lexical JSON to HTML for display
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

    if (loading) {
        return <div className="loading-state">Loading journal...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }
    
    const initialConfig = {
        namespace: 'JournalEditor',
        onError: (e) => console.error(e),
        editable: false,
        editorState: editorState,
    };

    return (
        <div className="journal-page-container">
            <header className="journal-page-header">
                <button onClick={handleBack} className="back-button">Back to Dashboard</button>
                <h1>{journal.title}</h1>
            </header>
            
            {error && (
                <div className="error-message" style={{color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px'}}>
                    {error}
                    <button 
                        onClick={() => setError(null)} 
                        style={{marginLeft: '10px', padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="journal-page-content">
                <LexicalComposer initialConfig={initialConfig}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-class read-only" />}
                        placeholder={<div className="placeholder">Start typing here...</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </LexicalComposer>
                
                {/* Alternative display for better content rendering */}
                <div className="journal-content-display" 
                     dangerouslySetInnerHTML={{ __html: convertLexicalToHtml(journal.content) }} 
                />
                
                <p className="journal-date">Created on: {new Date(journal.date_created).toLocaleDateString()}</p>

                {journal.comic_entry ? (
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ textAlign: 'center' }}>Your Comic Strip</h3>
                        <div className="comic-image-container">
                            <img src={journal.comic_entry.comic_image} alt="Generated Comic" className="comic-image" />
                        </div>
                    </div>
                ) : (
                    <ComicGenerator journalEntryId={journal.id} />
                )}
            </div>
        </div>
    );
};

export default JournalPage;