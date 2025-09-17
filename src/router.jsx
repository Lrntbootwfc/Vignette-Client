import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
// import ErrorBoundary from './components/ErrorBoundary';
import JournalPage from './pages/JournalPage';
import FolderExplorer from './pages/FolderExplorer';
import CharactersPage from './pages/CharacterPage';


const AppRouter = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
                <Route
                    path="/"
                    element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                    path="/journal/:id"
                    element={isAuthenticated ? <JournalPage /> : <Navigate to="/login" />}
                />

                {/* Folder explorer (all saved entries) */}
                <Route
                    path="/folders"
                    element={isAuthenticated ? <FolderExplorer /> : <Navigate to="/login" />}
                />

                {/* Character mapping page */}
                <Route
                    path="/characters"
                    element={isAuthenticated ? <CharactersPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
