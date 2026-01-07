// Generic API service for Dashboard, Automations, Agents, Admin, and Auth
import axios from "axios";
import { API } from "../types";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
// Request interceptor for adding auth token
apiClient.interceptors.request.use(
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login on unauthorized
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // --- Auth ---
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn('Backend login failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      if (credentials.email && credentials.password) {
        return {
          id: 'demo-user-123',
          name: 'Demo User',
          email: credentials.email,
          avatar: ''
        };
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to connect to server');
    }
  },

  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.warn('Backend signup failed, falling back to mock auth for demo:', error.message);

      // Mock fallback for demo purposes
      return {
        id: 'demo-user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        avatar: ''
      };
    }
  },

  // --- Dashboard Stats ---
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Mock fallback
      return {
        totalChats: 24,
        activeAgents: 6,
        tokensUsed: 450230,
        savedTime: '18h 45m'
      };
    }
  },

  async getAdminOverviewStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Backend admin stats failed:', error.message);
      // Only fallback if specifically in a demo environment or if backend is unreachable
      if (error.code === 'ECONNABORTED' || !error.response) {
        const agents = JSON.parse(localStorage.getItem('mock_agents') || '[]');
        return {
          totalUsers: 0,
          activeAgents: agents.length,
          pendingApprovals: 0,
          totalRevenue: 0,
          openComplaints: 0,
          recentActivity: [],
          inventory: agents.map(a => ({
            ...a,
            id: a._id || a.id,
            name: a.agentName || a.name,
            pricing: a.pricing || 'Free',
            status: a.status || 'Active'
          }))
        };
      }
      throw error;
    }
  },



  async getCreatedAgents() {
    try {
      const response = await apiClient.get('/agents/created-by-me');
      return response.data;
    } catch (error) {
      // Mock fallback: Return all local mock agents (assuming I am the owner in demo)
      const stored = localStorage.getItem('mock_agents');
      if (stored) return JSON.parse(stored);
      return [];
    }
  },

  async getAgents(params = {}) {
    try {
      const response = await apiClient.get('/agents', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch agents from backend:', error.message);
      // Return empty array instead of mock data to properly reflect backend state
      return [];
    }
  },

  async getUserAgents(userId) {
    try {
      const response = await apiClient.post('/agents/get_my_agents', { userId });
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch user agents from server");
      return { agents: [] };
    }
  },

  async createAgent(agentData) {
    try {
      const response = await apiClient.post('/agents', agentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create agent on backend:', error.response?.data || error.message);

      // If unauthorized, we MUST throw so the UI can redirect or show error
      if (error.response?.status === 401) {
        throw new Error("Unauthorized: Please login again.");
      }

      // Fallback only if backend is completely down (Demo Mode)
      if (!error.response) {
        const stored = JSON.parse(localStorage.getItem('mock_agents') || '[]');
        const newAgent = { ...agentData, _id: Date.now().toString(), id: Date.now().toString() };
        stored.push(newAgent);
        localStorage.setItem('mock_agents', JSON.stringify(stored));
        return newAgent;
      }

      throw error;
    }
  },

  async updateAgent(id, updates) {
    try {
      const response = await apiClient.put(`/agents/${id}`, updates);
      return response.data;
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('mock_agents') || '[]');
      const index = stored.findIndex(a => a._id === id);

      if (index !== -1) {
        stored[index] = { ...stored[index], ...updates };
        localStorage.setItem('mock_agents', JSON.stringify(stored));
        return stored[index];
      }
      return null;
    }
  },

  async deleteAgent(id) {
    try {
      const response = await apiClient.delete(`/agents/${id}`);
      return response.data;
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('mock_agents') || '[]');
      const filtered = stored.filter(a => a._id !== id);
      localStorage.setItem('mock_agents', JSON.stringify(filtered));
      return true;
    }
  },

  // --- Review Workflow ---
  async submitForReview(id) {
    try {
      const response = await apiClient.post(`/agents/submit-review/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    }
  },

  async approveAgent(id, message) {
    try {
      const response = await apiClient.post(`/agents/approve/${id}`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to approve agent:", error.response ? error.response.data : error.message);
      throw error;
    }
  },

  async rejectAgent(id, reason) {
    try {
      const response = await apiClient.post(`/agents/reject/${id}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Failed to reject agent:", error);
      throw error;
    }
  },

  async approveAgentDeletion(id) {
    const response = await apiClient.post(`/agents/admin/approve-deletion/${id}`);
    return response.data;
  },

  async rejectAgentDeletion(id, reason) {
    const response = await apiClient.post(`/agents/admin/reject-deletion/${id}`, { reason });
    return response.data;
  },

  async getVendorRevenue() {
    try {
      const response = await apiClient.get('/revenue/vendor');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor revenue:", error);
      throw error;
    }
  },

  async getAdminRevenueStats() {
    try {
      const response = await apiClient.get('/revenue/admin');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin revenue:", error);
      // Fallback or rethrow
      return {
        overview: { totalGross: 0, totalVendorPayouts: 0, totalPlatformNet: 0 },
        appPerformance: []
      };
    }
  },

  async getVendorTransactions() {
    try {
      const response = await apiClient.get('/revenue/transactions');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vendor transactions:", error);
      throw error;
    }
  },

  async getAdminTransactions() {
    try {
      const response = await apiClient.get('/revenue/admin/transactions');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin transactions:", error);
      return []; // Return empty array on error
    }
  },

  async downloadInvoice(transactionId) {
    try {
      const response = await apiClient.get(`/revenue/invoice/${transactionId}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Failed to download invoice:", error);
      throw error;
    }
  },

  // --- Notifications ---
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.warn("Using mock notifications");
      return [];
    }
  },

  async markNotificationRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  },

  // --- Automations ---
  async getAutomations() {
    try {
      const response = await apiClient.get('/automations');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_automations');
      if (stored) return JSON.parse(stored);

      const defaults = [
        { id: '1', name: 'Daily Digest', description: 'Summarize unread emails at 9 AM', active: true, type: 'Email' },
        { id: '2', name: 'Lead Qualifier', description: 'Score incoming leads from CRM', active: false, type: 'CRM' },
        { id: '3', name: 'Code Reviewer', description: 'Auto-review PRs on GitHub', active: true, type: 'Dev' },
        { id: '4', name: 'Meeting Notes', description: 'Transcribe and summarize Zoom calls', active: true, type: 'Productivity' }
      ];

      localStorage.setItem('mock_automations', JSON.stringify(defaults));
      return defaults;
    }
  },

  async toggleAutomation(id) {
    try {
      const response = await apiClient.post(`/automations/${id}/toggle`);
      return response.data;
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('mock_automations') || '[]');

      const updated = stored.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      );

      localStorage.setItem('mock_automations', JSON.stringify(updated));

      return updated.find(a => a.id === id);
    }
  },

  // --- Admin ---
  async getAdminSettings() {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    } catch (error) {
      const stored = localStorage.getItem('mock_admin_settings');
      if (stored) return JSON.parse(stored);

      return {
        allowPublicSignup: true,
        defaultModel: 'gemini-2.5-flash',
        maxTokensPerUser: 500000,
        organizationName: 'ACME Corp'
      };
    }
  },

  async updateAdminSettings(settings) {
    try {
      const response = await apiClient.post('/admin/settings', settings);
      return response.data;
    } catch (error) {
      localStorage.setItem('mock_admin_settings', JSON.stringify(settings));
      return settings;
    }
  },

  async getAllUsers() {
    try {
      const response = await apiClient.get('/user/all');
      return response.data;
    } catch (error) {
      console.error('Backend get users failed:', error.message);
      throw error;
    }
  },

  async toggleBlockUser(id, isBlocked) {
    try {
      const response = await apiClient.put(`/user/${id}/block`, { isBlocked });
      return response.data;
    } catch (error) {
      console.error("Failed to block/unblock user:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      await apiClient.delete(`/user/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  // --- Reports ---
  async submitReport(reportData) {
    try {
      const response = await apiClient.post('/reports/submit', reportData);
      return response.data;
    } catch (error) {
      console.warn("Backend report submission failed, using mock:", error.message);
      // Mock successful response for demo
      return { success: true, message: "Report submitted successfully (mock)" };
    }
  },

  async getReports() {
    try {
      const response = await apiClient.get('/reports');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return [];
    }
  },

  async resolveReport(id, status, resolutionNote) {
    try {
      const response = await apiClient.put(`/reports/${id}/resolve`, { status, resolutionNote });
      return response.data;
    } catch (error) {
      console.error("Failed to resolve report:", error);
      throw error;
    }
  },

  async deleteReport(id) {
    try {
      await apiClient.delete(`/reports/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error;
    }
  },


  async toggleMaintenance(enabled) {
    try {
      const response = await apiClient.post('/admin/settings/maintenance', { enabled });
      return response.data;
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error);
      throw error;
    }
  },

  async toggleKillSwitch(enabled) {
    try {
      const response = await apiClient.post('/admin/settings/killswitch', { enabled });
      return response.data;
    } catch (error) {
      console.error("Failed to toggle kill switch:", error);
      throw error;
    }
  },

  async updateRateLimit(limit) {
    try {
      const response = await apiClient.post('/admin/settings/ratelimit', { limit });
      return response.data;
    } catch (error) {
      console.error("Failed to update rate limit:", error);
      throw error;
    }
  },

  async replyToVendorTicket(ticketId, message) {
    try {
      const response = await apiClient.post(`/reports/${ticketId}/reply`, { message });
      return response.data;
    } catch (error) {
      console.error("Failed to send reply:", error);
      throw error;
    }
  },

  // --- Personal Assistant ---
  async getPersonalTasks(params) {
    try {
      const response = await apiClient.get('/personal-assistant/tasks', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return [];
    }
  },

  async createPersonalTask(data) {
    try {
      const response = await apiClient.post('/personal-assistant/tasks', data);
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  },

  async updatePersonalTask(id, data) {
    try {
      const response = await apiClient.put(`/personal-assistant/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  },

  async deletePersonalTask(id) {
    try {
      const response = await apiClient.delete(`/personal-assistant/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }
};

export default apiService;