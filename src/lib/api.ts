
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper to handle auth and refresh tokens
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const accessToken = localStorage.getItem('accessToken');

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
        credentials: 'include' as RequestCredentials,
    };

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, config);
    } catch (err) {
        console.error('API Fetch Error:', err);
        throw new Error('Impossible de contacter le serveur. Vérifiez que le backend est lancé sur le port 5000.');
    }

    // Handle 401 (Unauthorized) - attempt to refresh token
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
        let refreshResponse;
        try {
            refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' as RequestCredentials,
            });
        } catch (err) {
            // If refresh fails due to network, just logout
            localStorage.removeItem('accessToken');
            window.location.href = '/dashboard/login';
            return;
        }

        if (refreshResponse && refreshResponse.ok) {
            const { accessToken: newAccessToken } = await refreshResponse.json();
            localStorage.setItem('accessToken', newAccessToken);

            // Retry original request
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: 'include' as RequestCredentials });
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
