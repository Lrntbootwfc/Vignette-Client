import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import './App.css';

function App() {
  const [journalContent, setJournalContent] = useState('');

  const fetchBackendData = async () => {
    try {
      // Accessing the environment variable via import.meta.env
      const response = await fetch(`${import.meta.env.VITE_API_URL}/`);
      const data = await response.json();
      console.log('Data from backend:', data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Comic Diary</h1>
        <p>A place for your thoughts, turned into a comic.</p>
        <button onClick={fetchBackendData}>Test Backend Connection</button>
      </header>
      <main>
        <div className="rich-text-editor-container">
          <ReactQuill
            theme="snow"
            value={journalContent}
            onChange={setJournalContent}
            placeholder="Write your diary entry here..."
          />
        </div>
      </main>
    </div>
  );
}

export default App;