import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { useAuth } from '../context/AuthContext'

// SVG Icons
const LogoIcon = () => (
    <svg viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="14" fill="currentColor" />
        <circle cx="11" cy="13" r="2.5" fill="white" />
        <circle cx="21" cy="13" r="2.5" fill="white" />
        <path d="M10 20 Q16 25 22 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="7" cy="16" rx="3" ry="4" fill="currentColor" />
        <ellipse cx="25" cy="16" rx="3" ry="4" fill="currentColor" />
    </svg>
)

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const BellIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
)

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const BookmarkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
)

const ChevronDownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

const LogOutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { openCreateModal } = useApp()
    const { currentUser, userProfile, isAuthenticated, openAuthModal, logout } = useAuth()
    const navigate = useNavigate()
    const userMenuRef = useRef(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleLogout = async () => {
        await logout()
        setShowUserMenu(false)
    }

    const handleCreatePost = () => {
        if (isAuthenticated) {
            openCreateModal()
        } else {
            openAuthModal('login')
        }
    }

    // Get user initials for avatar
    const getInitials = () => {
        if (userProfile?.username) {
            return userProfile.username.charAt(0).toUpperCase()
        }
        if (currentUser?.displayName) {
            return currentUser.displayName.charAt(0).toUpperCase()
        }
        return 'U'
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        <LogoIcon />
                        <span>S Reddit</span>
                    </Link>
                </div>

                <div className="header-center">
                    <form className="header-search" onSubmit={handleSearch}>
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search scholarships, questions, hubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </form>
                </div>

                <div className="header-right">
                    {isAuthenticated ? (
                        <>
                            <button
                                className="btn btn-icon btn-ghost tooltip"
                                data-tooltip="Notifications"
                                aria-label="Notifications"
                            >
                                <BellIcon />
                            </button>

                            <button
                                className="btn btn-icon btn-ghost tooltip"
                                data-tooltip="Bookmarks"
                                aria-label="Bookmarks"
                            >
                                <BookmarkIcon />
                            </button>

                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleCreatePost}
                                aria-label="Create post"
                            >
                                <PlusIcon />
                                <span className="hide-mobile">Create Post</span>
                            </button>

                            {/* User Menu */}
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    aria-label="User menu"
                                >
                                    <div className="user-avatar">
                                        {currentUser?.photoURL ? (
                                            <img src={currentUser.photoURL} alt="" />
                                        ) : (
                                            getInitials()
                                        )}
                                    </div>
                                    <ChevronDownIcon />
                                </button>

                                {showUserMenu && (
                                    <div className="user-menu-dropdown">
                                        <div className="user-menu-header">
                                            <div className="user-menu-name">
                                                {userProfile?.username || currentUser?.displayName || 'User'}
                                            </div>
                                            <div className="user-menu-email">
                                                {currentUser?.email}
                                            </div>
                                            <div className="user-menu-karma">
                                                <StarIcon />
                                                <span>{userProfile?.karma || 0} karma</span>
                                            </div>
                                        </div>

                                        <div className="user-menu-items">
                                            <button className="user-menu-item">
                                                <UserIcon />
                                                <span>Profile</span>
                                            </button>
                                            <button className="user-menu-item">
                                                <BookmarkIcon />
                                                <span>Saved Posts</span>
                                            </button>
                                            <button className="user-menu-item">
                                                <SettingsIcon />
                                                <span>Settings</span>
                                            </button>
                                            <button
                                                className="user-menu-item danger"
                                                onClick={handleLogout}
                                            >
                                                <LogOutIcon />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-ghost"
                                onClick={() => openAuthModal('login')}
                            >
                                Log In
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={() => openAuthModal('signup')}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
