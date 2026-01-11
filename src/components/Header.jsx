import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../App'

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

function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const { openCreateModal } = useApp()
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // For now, just navigate home - search functionality can be expanded
            navigate(`/?search=${encodeURIComponent(searchQuery)}`)
        }
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
                        onClick={openCreateModal}
                        aria-label="Create post"
                    >
                        <PlusIcon />
                        <span className="hide-mobile">Create Post</span>
                    </button>

                    <button
                        className="btn btn-icon btn-ghost tooltip"
                        data-tooltip="Profile"
                        aria-label="Profile"
                    >
                        <UserIcon />
                    </button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="mobile-search-overlay">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="button" onClick={() => setShowMobileSearch(false)}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </header>
    )
}

export default Header
