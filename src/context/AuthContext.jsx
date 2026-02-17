import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'campusshare_auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const login = (email, password) => {
        // Mock login — accept any credentials
        const name = email.split('@')[0];
        const mockUser = {
            id: 'user_' + Date.now(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email,
            avatar: null,
            joinedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setShowAuthModal(false);
        return mockUser;
    };

    const signup = (name, email, password) => {
        const mockUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            avatar: null,
            joinedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setShowAuthModal(false);
        return mockUser;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            signup,
            logout,
            showAuthModal,
            setShowAuthModal,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
