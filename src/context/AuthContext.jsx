// Authentication Context
import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthChange,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    resetPassword,
    getUserProfile
} from '../firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login', 'signup', 'reset'

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user profile
                try {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Auth functions
    const signup = async (email, password, username) => {
        const result = await signUpWithEmail(email, password, username);
        if (result.user) {
            closeAuthModal();
        }
        return result;
    };

    const login = async (email, password) => {
        const result = await signInWithEmail(email, password);
        if (result.user) {
            closeAuthModal();
        }
        return result;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithGoogle();
        if (result.user) {
            closeAuthModal();
        }
        return result;
    };

    const logout = async () => {
        const result = await signOutUser();
        return result;
    };

    const forgotPassword = async (email) => {
        return await resetPassword(email);
    };

    // Modal controls
    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
    };

    const switchAuthMode = (mode) => {
        setAuthModalMode(mode);
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        isAuthenticated: !!currentUser,
        authModalOpen,
        authModalMode,
        signup,
        login,
        loginWithGoogle,
        logout,
        forgotPassword,
        openAuthModal,
        closeAuthModal,
        switchAuthMode
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
