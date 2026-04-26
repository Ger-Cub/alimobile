
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper to handle auth and refresh tokens
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');

    const headers = new Headers(options.headers || {});
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const config = {
        ...options,
        headers,
    };

    let response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle 401 (Unauthorized) - attempt to refresh token
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // The refresh token is in an HttpOnly cookie, so we need to include credentials
        });

        if (refreshResponse.ok) {
            const { accessToken: newAccessToken } = await refreshResponse.json();
            localStorage.setItem('accessToken', newAccessToken);

            // Retry original request
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        } else {
            // Refresh failed, logout
            localStorage.removeItem('accessToken');
            window.location.href = '/dashboard/login';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
}
