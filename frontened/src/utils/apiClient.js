/**
 * Centralized API client for communicating with the HelpJi backend.
 * Handles:
 * - Base URL configuration
 * - Request/response interceptors
 * - Automatic Authorization header injection
 * - Token refresh on 401 responses
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

let accessToken = null;
let onRefreshFailed = null; // callback when refresh token fails

/**
 * Set the current access token for subsequent requests.
 * @param {string|null} token
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Get the current access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Register a callback for when token refresh fails (e.g., redirect to login).
 * @param {Function} cb
 */
export function setOnRefreshFailed(cb) {
  onRefreshFailed = cb;
}

/**
 * Internal fetch wrapper with JSON handling, auth headers, and token refresh.
 *
 * @param {string} endpoint - API path (e.g., '/auth/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Parsed JSON response { success, message, data }
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach access token if available
  const effectiveToken = accessToken || (typeof localStorage !== 'undefined' ? (localStorage.getItem('helpji_token') || localStorage.getItem('token')) : null);
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  // Build fetch config
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // include cookies (refreshToken)
    ...options.fetchOptions,
  };

  // Attach body (skip for GET/HEAD)
  if (options.body && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    throw new ApiClientError(0, 'Network error. Please check your connection.', error);
  }

  // Try to parse JSON response
  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Invalid server response', data: null };
  }

  // If 401 and we have a token, try to refresh
  if (response.status === 401 && accessToken && endpoint !== '/auth/refresh-token') {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${accessToken}`;
      fetchOptions.headers = headers;

      try {
        response = await fetch(url, fetchOptions);
        data = await response.json();
      } catch (error) {
        throw new ApiClientError(0, 'Network error on retry.', error);
      }
    } else {
      // Refresh failed — call the failure handler
      if (onRefreshFailed) {
        onRefreshFailed();
      }
      throw new ApiClientError(401, data.message || 'Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, data.message || 'Request failed', data.data);
  }

  return data;
}

/**
 * Attempt to refresh the access token using the HTTP-only cookie.
 * @returns {Promise<boolean>} Whether refresh succeeded
 */
async function attemptTokenRefresh() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      accessToken = data.data.accessToken;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Custom error class for API client errors.
 */
export class ApiClientError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ── Convenience methods ───────────────────────────────────────────────────

const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

