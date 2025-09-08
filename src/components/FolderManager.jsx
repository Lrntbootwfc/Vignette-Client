import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FolderManager = ({ onFolderSelect, selectedFolder }) => {
    const [folders, setFolders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newFolder, setNewFolder] = useState({ name: '', color: '#ffffff' });

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await api.get('/folders/');
            setFolders(response.data);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const handleCreateFolder = async () => {
        try {
            await api.post('/folders/', newFolder);
            setNewFolder({ name: '', color: '#ffffff' });
            setShowForm(false);
            fetchFolders();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <div className="folder-manager">
            <h3>Folders</h3>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Create New Folder'}
            </button>

            {showForm && (
                <div className="folder-form">
                    <input
                        placeholder="Folder Name"
                        value={newFolder.name}
                        onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                    />
                    <input
                        type="color"
                        value={newFolder.color}
                        onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                    />
                    <button onClick={handleCreateFolder}>Create Folder</button>
                </div>
            )}

            <div className="folders-list">
                <div
                    className={`folder-item ${selectedFolder === null ? 'selected' : ''}`}
                    onClick={() => onFolderSelect(null)}
                >
                    <span>All Journals</span>
                </div>
                {folders.map(folder => (
                    <div
                        key={folder.id}
                        className={`folder-item ${selectedFolder === folder.id ? 'selected' : ''}`}
                        onClick={() => onFolderSelect(folder.id)}
                        style={{ borderLeft: `4px solid ${folder.color}` }}
                    >
                        <span>{folder.name}</span>
                        {folder.is_locked && <span>🔒</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderManager;