import axios from 'axios';
import { API } from '../types';

const API_BASE_URL = API;

// Create axios instance
const vendorClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
vendorClient.interceptors.request.use(
    (config) => {
        // Try getting token specifically
        const token = localStorage.getItem('token');

        // Also check user object just in case
        const userStr = localStorage.getItem('user');

        let validToken = token;

        if (!validToken && userStr) {
            try {
                const userData = JSON.parse(userStr);
                if (userData.token) {
                    validToken = userData.token;
                }
            } catch (e) {
                console.error('Error parsing user data in interceptor', e);
            }
        }

        if (validToken) {
            config.headers.Authorization = `Bearer ${validToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const vendorService = {
    // Get all apps for a specific vendor (Logged in user)
    getVendorApps: async () => {
        try {
            const response = await vendorClient.get('/agents/created-by-me');
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor apps:', error);
            throw error;
        }
    },

    // Get detailed info for a specific app
    getAppDetails: async (appId) => {
        try {
            console.log(`[VendorService] Fetching details for ${appId}...`);
            const response = await vendorClient.get(`/agents/${appId}/details`);
            console.log('[VendorService] Success:', response.data);
            return response.data;
        } catch (error) {
            console.error('[VendorService] Error fetching app details:', error);
            throw error;
        }
    },

    // Deactivate an app
    deactivateApp: async (appId) => {
        try {
            const response = await vendorClient.patch(`/agents/${appId}/deactivate`);
            return response.data;
        } catch (error) {
            console.error('Error deactivating app:', error);
            throw error;
        }
    },

    // Reactivate an app
    reactivateApp: async (appId) => {
        try {
            const response = await vendorClient.patch(`/agents/${appId}/reactivate`);
            return response.data;
        } catch (error) {
            console.error('Error reactivating app:', error);
            throw error;
        }
    },

    // Submit app for review
    submitForReview: async (appId) => {
        try {
            const response = await vendorClient.post(`/agents/submit-review/${appId}`);
            return response.data;
        } catch (error) {
            console.error('[VendorService] Error submitting app:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update app details (e.g. url)
    updateApp: async (appId, data) => {
        try {
            const response = await vendorClient.put(`/agents/${appId}`, data); // Note: Changed to PUT to match agentRoutes if it was PUT, checking... agentRoutes uses PUT /:id
            return response.data;
        } catch (error) {
            console.error('Error updating app:', error);
            throw error;
        }
    },

    // Delete app permanently
    deleteApp: async (appId) => {
        try {
            const response = await vendorClient.delete(`/agents/${appId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting app:', error);
            throw error;
        }
    },

    // Create a new app (Draft)
    createAgent: async (data, token) => {
        try {
            // If token is passed explicitly (e.g. during creation flow before it's fully set?), use it.
            // But interceptor handles it. 
            // We can just use vendorClient.
            const response = await vendorClient.post('/agents', data);
            return response.data;
        } catch (error) {
            console.error('Error creating app:', error);
            throw error;
        }
    },

    // Get Support Messages for Vendor
    getSupportMessages: async (userId, type = 'AdminSupport') => {
        try {
            const response = await vendorClient.get(`/support/user/${userId}?type=${type}`);
            // If the endpoint is in agentRoutes or supportRoutes?
            // supportRoutes is POST /. 
            // The Source VendorAdminSupport calls GET /api/agents/vendor/:userId/support...
            // I need to check if I have this route in my backend merge!
            // I merged agentRoutes.js (Source). Let's check if it has this route.
            return response.data;
        } catch (error) {
            console.error('Error fetching support messages:', error);
            throw error;
        }
    },

    // Submit Support Ticket
    submitSupportTicket: async (data) => {
        try {
            const response = await vendorClient.post('/support', data);
            return response.data;
        } catch (error) {
            console.error('Error submitting support ticket:', error);
            throw error;
        }
    }
};

export default vendorService;
