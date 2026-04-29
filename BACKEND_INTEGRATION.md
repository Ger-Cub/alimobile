# 🚀 Backend Integration Guide - Ali Mobile Frontend

## 📋 Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [Authentication Logic](#authentication-logic)
3. [API Wrapper (apiFetch)](#api-wrapper-apifetch)
4. [Testing Connection](#testing-connection)
5. [Important Notes](#important-notes)

---

## 🌍 Environment Configuration

The frontend communicates with the backend via the `VITE_API_URL` environment variable.

### Setup
Create or update your `.env` file (not tracked in git):

```env
# Development
VITE_API_URL=http://localhost:5000/api

# Production (example)
# VITE_API_URL=https://your-api-production.com/api
```

The `.env.example` file documents the expected variables.

---

## 🔐 Authentication Logic

The system uses a **two-token strategy**:

### 1. **Access Token** (JWT)
- **Duration**: 15 minutes
- **Storage**: `localStorage` (key: `accessToken`)
- **Usage**: Passed in the `Authorization: Bearer <token>` header
- **Role**: Used for API requests

### 2. **Refresh Token** (JWT)
- **Duration**: 7 days
- **Storage**: HttpOnly Cookie (managed automatically by the browser)
- **Role**: Used to obtain a new access token when the current one expires

### 📍 Login Flow
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "accessToken": "jwt_token_here", ... }
Action: Store accessToken in localStorage
```

### 📍 Logout Flow
```
POST /api/auth/logout
Action: Remove accessToken from localStorage and redirect to login
```

### 📍 Token Refresh (Automatic)
When an API call returns `401 Unauthorized`:
1. The `apiFetch` wrapper automatically calls `POST /api/auth/refresh-token`
2. The refresh token is sent as an HttpOnly cookie (automatically included)
3. Backend returns a new access token
4. Original API call is retried with the new token
5. If refresh fails, user is redirected to login page

---

## 🛠 API Wrapper (apiFetch)

Located in: [src/lib/api.ts](src/lib/api.ts)

The `apiFetch` function is a custom fetch wrapper that handles:
- ✅ Automatic token injection from localStorage
- ✅ Transparent token refresh on 401
- ✅ Session cookie management (`credentials: 'include'`)
- ✅ Proper Content-Type headers
- ✅ Error handling

### Usage Example

```typescript
import { apiFetch } from '@/lib/api';

// GET request
const data = await apiFetch('/payment/transactions');

// POST request
const result = await apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com', password: '1234' })
});

// File upload (FormData)
const formData = new FormData();
formData.append('file', file);
const uploadResult = await apiFetch('/admin/upload-profile-pic', {
  method: 'POST',
  body: formData  // Note: Don't set Content-Type, FormData handles it
});
```

### How It Works

```typescript
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    // 1. Retrieve access token from localStorage
    let accessToken = localStorage.getItem('accessToken');

    // 2. Setup headers with Authorization bearer token
    const headers = new Headers(options.headers || {});
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    // 3. Set Content-Type for JSON (unless FormData)
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // 4. CRITICAL: Include credentials for cookie transmission
    const config = {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials,
    };

    // 5. Make request
    let response = await fetch(`${API_URL}${endpoint}`, config);

    // 6. Handle 401 - attempt automatic token refresh
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Send refresh token cookie
        });

        if (refreshResponse.ok) {
            const { accessToken: newAccessToken } = await refreshResponse.json();
            localStorage.setItem('accessToken', newAccessToken);

            // Retry original request with new token
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(`${API_URL}${endpoint}`, { 
                ...options, 
                headers, 
                credentials: 'include' 
            });
        } else {
            // Refresh failed - session expired
            localStorage.removeItem('accessToken');
            window.location.href = '/dashboard/login';
        }
    }

    // 7. Error handling
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
}
```

---

## 🔑 Authentication Context

Located in: [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

The `AuthContext` provides:
- `user`: Current authenticated user (or null)
- `loading`: Loading state during auth check
- `login(email, password)`: Login function
- `logout()`: Logout function

### Usage in Components

```typescript
import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
    const { user, login, logout, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    
    if (!user) return <button onClick={() => login(email, password)}>Login</button>;
    
    return <button onClick={logout}>Logout</button>;
}
```

---

## 📍 API Routes Structure

### Authentication Routes
```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/refresh-token      - Refresh access token
GET    /api/auth/me                 - Get current user info
```

### Payment/Transaction Routes
```
GET    /api/payment/transactions    - List transactions
POST   /api/payment/send            - Send money
GET    /api/payment/balance         - Get user balance
```

### Admin Routes (Requires Authentication)
```
GET    /api/admin/...               - Admin endpoints
POST   /api/admin/...               - Admin operations
```

---

## 🧪 Testing Connection

Test the authentication flow in your Login component:

```typescript
import { useAuth } from '@/context/AuthContext';

export function LoginTest() {
    const { login } = useAuth();

    const handleTestLogin = async () => {
        try {
            await login('gerardcubakabisimwa@gmail.com', '1234');
            console.log('✅ Login successful!');
        } catch (err) {
            console.error('❌ Login failed:', err.message);
        }
    };

    return <button onClick={handleTestLogin}>Test Login</button>;
}
```

### Expected Flow
1. Click button → `login()` called
2. `apiFetch` makes POST to `/auth/login`
3. Backend returns `accessToken`
4. Token stored in `localStorage`
5. User redirected to dashboard
6. Subsequent API calls include the token in Authorization header

---

## ⚠️ Important Notes

### 1. CORS Configuration
- Backend must allow your frontend origin (e.g., `http://localhost:5173`)
- If you change the frontend port, update backend CORS settings
- See backend `server.js` or equivalent configuration

### 2. Credentials are CRITICAL
```typescript
credentials: 'include'  // ✅ ALWAYS include this
// Without it: Browser won't send/receive HttpOnly cookies
// This is required for refresh token mechanism to work
```

### 3. FormData Uploads
```typescript
// ✅ Correct: Don't set Content-Type for FormData
const formData = new FormData();
formData.append('file', file);
await apiFetch('/admin/upload', {
    method: 'POST',
    body: formData  // Browser automatically sets multipart/form-data
});

// ❌ Wrong: Setting Content-Type manually breaks uploads
headers.set('Content-Type', 'application/json');
```

### 4. Protected Routes
- Wrap components in `<AuthProvider>` (typically in `main.tsx`)
- Use `useAuth()` hook to check authentication status
- Implement route protection:

```typescript
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/dashboard/login" />;
    
    return <>{children}</>;
}
```

### 5. Error Handling
Always wrap API calls in try-catch:

```typescript
try {
    const data = await apiFetch('/payment/balance');
    console.log('Balance:', data.amount);
} catch (error) {
    console.error('API Error:', error.message);
    // User will be redirected to login if session expired
}
```

---

## 📋 Checklist

- ✅ Environment variable `VITE_API_URL` configured
- ✅ Backend running on configured URL
- ✅ `apiFetch` wrapper implemented
- ✅ `AuthContext` provider wraps app
- ✅ Login component uses `useAuth()` hook
- ✅ `credentials: 'include'` present in all fetch calls
- ✅ Token refresh mechanism tested
- ✅ Logout clears localStorage
- ✅ Protected routes redirect to login
- ✅ CORS configured on backend

---

## 🔗 Related Files

- [src/lib/api.ts](src/lib/api.ts) - API wrapper
- [src/context/AuthContext.tsx](src/context/AuthContext.tsx) - Auth context
- [src/pages/dashboard/Login.tsx](src/pages/dashboard/Login.tsx) - Login page
- [.env.example](.env.example) - Environment variables template
- [.env.production](.env.production) - Production environment (local only)

---

## 🚀 Next Steps

1. Ensure backend is running and accessible at `VITE_API_URL`
2. Test login with valid credentials
3. Verify tokens are stored correctly in localStorage
4. Test token refresh by waiting 15+ minutes or manually expiring token
5. Test logout functionality
6. Implement additional API calls using `apiFetch` wrapper
7. Add error notifications using `sonner` toast component

---

**Last Updated**: April 29, 2026
