import React, { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaLock, FaFileAlt, FaEllipsisV } from 'react-icons/fa';
import api from '../services/api';

const FolderExplorer = ({ onJournalOpen = () => {} }) => {
    const [treeData, setTreeData] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, node: null });

    useEffect(() => {
        fetchFoldersAndJournals();
    }, []);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ show: false, x: 0, y: 0, node: null });
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchFoldersAndJournals = async () => {
        try {
            const foldersRes = await api.get('/folders/');
            const journalsRes = await api.get('/journal-entries/');

            console.log('Folders response:', foldersRes);
            console.log('Journals response:', journalsRes);

            // Handle different response structures
            const foldersData = Array.isArray(foldersRes.data) ? foldersRes.data : 
                              Array.isArray(foldersRes) ? foldersRes : 
                              foldersRes.data?.results ? foldersRes.data.results : [];

            const journalsData = Array.isArray(journalsRes.data) ? journalsRes.data : 
                               Array.isArray(journalsRes) ? journalsRes : 
                               journalsRes.data?.results ? journalsRes.data.results : [];

            console.log('Processed folders data:', foldersData);
            console.log('Processed journals data:', journalsData);

            const folderNodes = foldersData.map(folder => ({
                id: folder.id,
                parent: folder.parent || 0,
                droppable: true,
                text: folder.name || folder.title || `Folder ${folder.id}`,
                color: folder.color,
                is_locked: folder.is_locked || false,
                type: 'folder'
            }));

            const journalNodes = journalsData.map(journal => ({
                id: 'j' + journal.id,
                parent: journal.folder || 0, // Ensure we use 0 for null/undefined folder values
                droppable: false,
                text: journal.title || journal.name || `Journal ${journal.id}`,
                journalId: journal.id,
                type: 'journal'
            }));

            console.log('Final tree data:', [...folderNodes, ...journalNodes]);
            setTreeData([...folderNodes, ...journalNodes]);
        } catch (err) {
            console.error('Failed to fetch folders/journals:', err);
            console.error('Error details:', err.response || err.message);
            // Set empty data on error so component doesn't break
            setTreeData([]);
        }
    };

    const buildTree = (data, parentId = 0) => {
        return data
            .filter(node => {
                // Handle both number and string comparisons
                const nodeParent = node.parent;
                return (
                    nodeParent === parentId || 
                    nodeParent === String(parentId) || 
                    (nodeParent === null && parentId === 0) ||
                    (nodeParent === undefined && parentId === 0)
                );
            })
            .map(node => ({
                ...node,
                children: buildTree(data, node.id)
            }));
    };

    const toggleExpanded = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const handleContextMenu = (e, node) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            node: node
        });
    };

    const handleRename = async () => {
        const newName = prompt('Enter new name', contextMenu.node.text);
        if (!newName) return;
        
        setTreeData(treeData.map(n => 
            n.id === contextMenu.node.id ? { ...n, text: newName } : n
        ));
        
        try {
            if (contextMenu.node.type === 'journal') {
                await api.patch(`/journal-entries/${contextMenu.node.journalId}/`, { title: newName });
            } else {
                await api.patch(`/folders/${contextMenu.node.id}/`, { name: newName });
            }
        } catch (err) {
            console.error('Failed to rename:', err);
        }
        setContextMenu({ show: false, x: 0, y: 0, node: null });
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        
        try {
            if (contextMenu.node.type === 'journal') {
                await api.delete(`/journal-entries/${contextMenu.node.journalId}/`);
            } else {
                await api.delete(`/folders/${contextMenu.node.id}/`);
            }
            setTreeData(treeData.filter(n => n.id !== contextMenu.node.id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
        setContextMenu({ show: false, x: 0, y: 0, node: null });
    };

    const handleLockToggle = async () => {
        if (contextMenu.node.type === 'journal') return; // Only folders can be locked
        
        const locked = !contextMenu.node.is_locked;
        setTreeData(treeData.map(n => 
            n.id === contextMenu.node.id ? { ...n, is_locked: locked } : n
        ));
        
        try {
            await api.patch(`/folders/${contextMenu.node.id}/`, { is_locked: locked });
        } catch (err) {
            console.error('Failed to toggle lock:', err);
        }
        setContextMenu({ show: false, x: 0, y: 0, node: null });
    };

    const handleNodeClick = (node) => {
        if (node.type === 'journal') {
            onJournalOpen(node.journalId);
        } else {
            toggleExpanded(node.id);
        }
    };

    const renderNode = (node, depth = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedNode?.id === node.id;

        return (
            <div key={node.id}>
                <div
                    className="tree-node"
                    style={{
                        paddingLeft: depth * 20 + 10,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        margin: '2px 0',
                        backgroundColor: isSelected ? '#ffd6e7' : 'transparent',
                        transition: 'all 0.2s ease',
                        color: isSelected ? '#d81b60' : '#333'
                    }}
                    onClick={() => {
                        setSelectedNode(node);
                        handleNodeClick(node);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.target.style.backgroundColor = '#ffe6f2';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.target.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    {node.type === 'folder' ? (
                        <>
                            {hasChildren && (
                                <span 
                                    style={{ 
                                        marginRight: '8px', 
                                        fontSize: '10px',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                        color: '#d81b60'
                                    }}
                                >
                                    ▶
                                </span>
                            )}
                            {isExpanded ? 
                                <FaFolderOpen color="#d81b60" size="16px" /> : 
                                <FaFolder color="#d81b60" size="16px" />
                            }
                            <span style={{ marginLeft: '10px', flex: 1, fontSize: '14px' }}>{node.text}</span>
                            {node.is_locked && <FaLock style={{ marginLeft: '5px', color: '#d81b60' }} size="12px" />}
                        </>
                    ) : (
                        <>
                            <div style={{ width: '17px', display: 'inline-block' }}></div>
                            <FaFileAlt style={{ color: '#ec407a' }} size="16px" />
                            <span style={{ marginLeft: '10px', flex: 1, fontSize: '14px' }}>{node.text}</span>
                        </>
                    )}
                    <FaEllipsisV 
                        style={{ 
                            opacity: 0.5, 
                            marginLeft: '5px',
                            fontSize: '12px',
                            color: '#d81b60'
                        }} 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, node);
                        }}
                    />
                </div>
                
                {node.type === 'folder' && isExpanded && hasChildren && (
                    <div style={{ marginLeft: '10px' }}>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const tree = buildTree(treeData);

    return (
        <div className="folder-explorer" style={{ 
            position: 'relative', 
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            padding: '15px',
            borderRadius: '12px',
            backgroundColor: '#fff5f9',
            boxShadow: '0 4px 12px rgba(216, 27, 96, 0.1)',
            border: '1px solid #ffcce0'
        }}>
            <h2 style={{ 
                color: '#d81b60', 
                marginTop: 0, 
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #ffcce0',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                My Journals
            </h2>
            
            <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                padding: '5px'
            }}>
                {tree.length > 0 ? (
                    tree.map(node => renderNode(node))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#d81b60',
                        fontStyle: 'italic'
                    }}>
                        No folders or journals found
                    </div>
                )}
            </div>

            {/* Custom Context Menu */}
            {contextMenu.show && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ffcce0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(216, 27, 96, 0.15)',
                        zIndex: 1000,
                        minWidth: '150px',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
                            transition: 'all 0.2s'
                        }}
                        onClick={handleRename}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ffe6f2';
                            e.target.style.color = '#d81b60';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#333';
                        }}
                    >
                        Rename
                    </div>
                    <div
                        style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
                            transition: 'all 0.2s'
                        }}
                        onClick={handleDelete}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ffe6f2';
                            e.target.style.color = '#d81b60';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#333';
                        }}
                    >
                        Delete
                    </div>
                    {contextMenu.node?.type === 'folder' && (
                        <div
                            style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#333',
                                transition: 'all 0.2s'
                            }}
                            onClick={handleLockToggle}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#ffe6f2';
                                e.target.style.color = '#d81b60';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#333';
                            }}
                        >
                            {contextMenu.node.is_locked ? 'Unlock' : 'Lock'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderExplorer;