import React, { useState, useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './App.css';
import api from './services/api';

function App() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );
  const [journals, setJournals] = useState([]);
  const [gamificationData, setGamificationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all journal entries for the current user
        const journalsResponse = await api.get('/journal-entries/journal-entries/');
        setJournals(journalsResponse.data);

        // Fetch gamification data
        const gamificationResponse = await api.get('/gamification/streaks/');
        if (gamificationResponse.data.length > 0) {
          setGamificationData(gamificationResponse.data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please check your backend server and ensure you are logged in correctly.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading user data...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to your Comic Diary</h1>
        {gamificationData.current_streak !== undefined && (
          <p>Current Streak: {gamificationData.current_streak} days</p>
        )}
      </header>
      <main>
        <div className="rich-text-editor-container">
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            placeholder="Write your diary entry here..."
          />
        </div>
        
        <h2>Your Journals</h2>
        <div className="journals-list">
          {journals.length > 0 ? (
            journals.map((journal) => (
              <div key={journal.id} className="journal-entry-card">
                <h3>{journal.title || 'Untitled Entry'}</h3>
                {/* We will update this later to handle Draft.js content */}
                <div dangerouslySetInnerHTML={{ __html: journal.content }} />
                <p>Date: {new Date(journal.date_created).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No journal entries yet. Start writing one above!</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
