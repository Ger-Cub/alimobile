
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Try to fetch the real profile from the backend
                    const profile = await apiFetch('/admin/me');
                    setUser({
                        id: profile.id || 'admin',
                        email: profile.email,
                        name: profile.name || '',
                    });
                } catch (err) {
                    // Fallback: try reading stored user from localStorage
                    const storedUser = localStorage.getItem('currentUser');
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                        } catch {
                            localStorage.removeItem('accessToken');
                        }
                    } else {
                        // Last fallback: keep token but clear user
                        localStorage.removeItem('accessToken');
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const { accessToken, name } = data;
        localStorage.setItem('accessToken', accessToken);
        const loggedUser: User = { id: 'admin', email, name: name || '' };
        localStorage.setItem('currentUser', JSON.stringify(loggedUser));
        setUser(loggedUser);
    };

    const logout = async () => {
        await apiFetch('/auth/logout', { method: 'POST' });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    const updateProfile = async (name: string) => {
        try {
            await apiFetch('/admin/me', {
                method: 'PATCH',
                body: JSON.stringify({ name }),
            });
        } catch (err) {
            // If backend endpoint unavailable, update locally only
            console.warn('Could not update profile on server, updating locally.');
        }
        const updated: User = { ...user!, name };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
