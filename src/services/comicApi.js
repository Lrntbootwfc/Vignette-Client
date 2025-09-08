// src/services/comicApi.js
import api from './api';

/**
 * Sends a request to the backend to create a comic from a journal entry.
 * @param {number} journalEntryId - The ID of the journal entry.
 * @param {number} characterId - The ID of the selected character.
 * @returns {Promise<object>} - A promise that resolves with the comic data.
 */
export const createComic = async (journalEntryId, characterId) => {
    try {
        const response = await api.post(`/journal-entries/${journalEntryId}/create-comic/`, {
            character_id: characterId,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating comic:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches a single comic entry by its ID.
 * @param {number} comicId - The ID of the comic entry.
 * @returns {Promise<object>} - A promise that resolves with the comic data.
 */
export const getComic = async (comicId) => {
    try {
        const response = await api.get(`/comic-entries/${comicId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comic:', error.response?.data || error.message);
        throw error;
    }
};