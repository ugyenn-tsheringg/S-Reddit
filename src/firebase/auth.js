// Firebase Authentication Service
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from './config';

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// ============ AUTH FUNCTIONS ============

// Sign up with email and password
export const signUpWithEmail = async (email, password, username) => {
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, {
            displayName: username
        });

        // Create user profile in Firestore
        await createUserProfile(user, { username });

        // Send email verification
        await sendEmailVerification(user);

        return { user, error: null };
    } catch (error) {
        console.error('Error signing up:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        console.error('Error signing in:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists, create if not
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await createUserProfile(user, {
                username: user.displayName || `user_${user.uid.slice(0, 8)}`
            });
        }

        return { user, error: null };
    } catch (error) {
        console.error('Error signing in with Google:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error);
        return { error: error.message };
    }
};

// Password reset
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        console.error('Error sending password reset:', error);
        return { error: getErrorMessage(error.code) };
    }
};

// ============ USER PROFILE ============

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;

        const userData = {
            uid: user.uid,
            email,
            username: additionalData.username || displayName || `user_${user.uid.slice(0, 8)}`,
            displayName: displayName || additionalData.username || 'Anonymous',
            photoURL: photoURL || null,
            karma: 0,
            postKarma: 0,
            commentKarma: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...additionalData
        };

        try {
            await setDoc(userRef, userData);
            return userData;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    return userSnap.data();
};

// Get user profile
export const getUserProfile = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return { error: null };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { error: error.message };
    }
};

// ============ AUTH STATE OBSERVER ============

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ============ ERROR MESSAGES ============

const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try logging in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed. Please try again.';
        case 'auth/popup-blocked':
            return 'Sign-in popup was blocked. Please allow popups and try again.';
        default:
            return 'An error occurred. Please try again.';
    }
};

export default auth;
