// Authentication Modal - Login / Signup / Password Reset
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function AuthModal() {
    const {
        authModalMode,
        closeAuthModal,
        switchAuthMode,
        login,
        signup,
        loginWithGoogle,
        forgotPassword
    } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.email) {
            setError('Email is required');
            return false;
        }

        if (authModalMode !== 'reset') {
            if (!formData.password) {
                setError('Password is required');
                return false;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
        }

        if (authModalMode === 'signup') {
            if (!formData.username) {
                setError('Username is required');
                return false;
            }

            if (formData.username.length < 3) {
                setError('Username must be at least 3 characters');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            if (authModalMode === 'login') {
                const result = await login(formData.email, formData.password);
                if (result.error) {
                    setError(result.error);
                }
            } else if (authModalMode === 'signup') {
                const result = await signup(formData.email, formData.password, formData.username);
                if (result.error) {
                    setError(result.error);
                }
            } else if (authModalMode === 'reset') {
                const result = await forgotPassword(formData.email);
                if (result.error) {
                    setError(result.error);
                } else {
                    setResetSent(true);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await loginWithGoogle();
            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeAuthModal();
        }
    };

    const getTitle = () => {
        switch (authModalMode) {
            case 'signup': return 'Sign Up';
            case 'reset': return 'Reset Password';
            default: return 'Log In';
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal auth-modal">
                <div className="modal-header">
                    <h2>{getTitle()}</h2>
                    <button className="modal-close" onClick={closeAuthModal} aria-label="Close">
                        <CloseIcon />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Reset Password Success */}
                    {authModalMode === 'reset' && resetSent ? (
                        <div className="auth-success">
                            <div className="auth-success-icon">
                                <CheckIcon />
                            </div>
                            <h3>Check your email</h3>
                            <p>We've sent a password reset link to <strong>{formData.email}</strong></p>
                            <button
                                className="btn btn-primary w-full mt-md"
                                onClick={() => {
                                    setResetSent(false);
                                    switchAuthMode('login');
                                }}
                            >
                                Back to Log In
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Google Sign In */}
                            {authModalMode !== 'reset' && (
                                <>
                                    <button
                                        className="btn btn-google w-full"
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
                                    >
                                        <GoogleIcon />
                                        Continue with Google
                                    </button>

                                    <div className="auth-divider">
                                        <span>OR</span>
                                    </div>
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Username (signup only) */}
                                {authModalMode === 'signup' && (
                                    <div className="form-group">
                                        <div className="input-with-icon">
                                            <UserIcon />
                                            <input
                                                type="text"
                                                name="username"
                                                className="form-input"
                                                placeholder="Username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div className="form-group">
                                    <div className="input-with-icon">
                                        <MailIcon />
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Password (not for reset) */}
                                {authModalMode !== 'reset' && (
                                    <div className="form-group">
                                        <div className="input-with-icon">
                                            <LockIcon />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                className="form-input"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete={authModalMode === 'signup' ? 'new-password' : 'current-password'}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Password (signup only) */}
                                {authModalMode === 'signup' && (
                                    <div className="form-group">
                                        <div className="input-with-icon">
                                            <LockIcon />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                className="form-input"
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Forgot Password Link */}
                                {authModalMode === 'login' && (
                                    <div className="auth-forgot">
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={() => switchAuthMode('reset')}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Please wait...' : getTitle()}
                                </button>
                            </form>

                            {/* Switch Mode */}
                            <div className="auth-switch">
                                {authModalMode === 'login' ? (
                                    <p>
                                        New to S Reddit?{' '}
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={() => switchAuthMode('signup')}
                                        >
                                            Sign Up
                                        </button>
                                    </p>
                                ) : authModalMode === 'signup' ? (
                                    <p>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={() => switchAuthMode('login')}
                                        >
                                            Log In
                                        </button>
                                    </p>
                                ) : (
                                    <p>
                                        Remember your password?{' '}
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={() => switchAuthMode('login')}
                                        >
                                            Log In
                                        </button>
                                    </p>
                                )}
                            </div>

                            {/* Terms */}
                            {authModalMode === 'signup' && (
                                <p className="auth-terms">
                                    By signing up, you agree to our{' '}
                                    <a href="#">Terms of Service</a> and{' '}
                                    <a href="#">Privacy Policy</a>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
