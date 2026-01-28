const API_URL = process.env.REACT_APP_API_URL || '';

// Handle token expiration and redirect to login
const handleAuthError = (error) => {
  if (error.status === 401 || error.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // For Vercel serverless functions, use relative URL
    const url = API_URL ? `${API_URL}${endpoint}` : `${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const error = new Error(errorData.message);
      error.status = response.status;
      
      // Handle authentication errors
      handleAuthError(error);
      
      throw error;
    }

    return response.json();
  },

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  },
  
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

export default api;
