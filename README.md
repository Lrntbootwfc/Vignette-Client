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