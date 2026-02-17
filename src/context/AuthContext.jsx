import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'campusshare_users';
const SESSION_KEY = 'campusshare_session';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(SESSION_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [showAuthModal, setShowAuthModal] = useState(false);

    const getUsers = () => {
        try {
            const saved = localStorage.getItem(USERS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    };

    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    const signup = (name, email, password, college) => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('Email already registered');
        }
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            college,
            createdAt: new Date().toISOString(),
        };
        saveUsers([...users, newUser]);
        const session = { id: newUser.id, name, email, college };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return session;
    };

    const login = (email, password, college) => {
        const users = getUsers();
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) throw new Error('Invalid email or password');
        const session = { id: found.id, name: found.name, email: found.email, college: college || found.college };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return session;
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    const canAccessResource = (resource) => {
        if (!resource) return false;
        if (resource.privacy !== 'private') return true;
        if (!user) return false;
        return user.college === resource.authorCollege;
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            signup,
            login,
            logout,
            showAuthModal,
            setShowAuthModal,
            canAccessResource,
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
