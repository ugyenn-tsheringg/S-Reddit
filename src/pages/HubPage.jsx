import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../App'
import PostCard from '../components/PostCard'
import Sidebar from '../components/Sidebar'

// SVG Icons
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const HotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10z" />
    </svg>
)

const NewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const TopIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)

const sortOptions = [
    { id: 'hot', label: 'Hot', icon: HotIcon },
    { id: 'new', label: 'New', icon: NewIcon },
    { id: 'top', label: 'Top', icon: TopIcon }
]

function HubPage() {
    const { name } = useParams()
    const { posts, hubs, openCreateModal } = useApp()
    const [sortBy, setSortBy] = useState('hot')
    const [isJoined, setIsJoined] = useState(false)

    const decodedName = decodeURIComponent(name)
    const hub = hubs.find(h => h.name.toLowerCase() === decodedName.toLowerCase())

    // Filter and sort posts for this hub
    const hubPosts = useMemo(() => {
        let result = posts.filter(p => p.hub.toLowerCase() === decodedName.toLowerCase())

        switch (sortBy) {
            case 'hot':
                result.sort((a, b) => {
                    const aScore = a.votes / Math.pow((Date.now() - new Date(a.createdAt)) / 3600000 + 2, 1.5)
                    const bScore = b.votes / Math.pow((Date.now() - new Date(b.createdAt)) / 3600000 + 2, 1.5)
                    return bScore - aScore
                })
                break
            case 'new':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
            case 'top':
                result.sort((a, b) => b.votes - a.votes)
                break
        }

        return result
    }, [posts, decodedName, sortBy])

    if (!hub) {
        return (
            <div className="container">
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-3xl)',
                    marginTop: 'var(--space-xl)'
                }}>
                    <h2>Hub not found</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-md)' }}>
                        The hub "{decodedName}" doesn't exist.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            {/* Hub Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                borderRadius: 'var(--radius-lg)',
                marginTop: 'var(--space-lg)',
                overflow: 'hidden'
            }}>
                <div style={{ height: '80px' }}></div>
                <div style={{
                    background: 'var(--color-bg-card)',
                    padding: 'var(--space-lg)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 'var(--space-lg)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        marginTop: '-40px',
                        border: '4px solid var(--color-bg-card)'
                    }}>
                        {hub.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-xs)' }}>
                            r/{hub.name}
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            {hub.description}
                        </p>
                    </div>

                    <button
                        className={`btn ${isJoined ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setIsJoined(!isJoined)}
                    >
                        {isJoined ? 'Joined' : 'Join'}
                    </button>
                </div>

                <div style={{
                    background: 'var(--color-bg-card)',
                    padding: '0 var(--space-lg) var(--space-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xl)',
                    borderTop: '1px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <UsersIcon />
                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                            {hub.members.toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>members</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--color-success)'
                        }}></span>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                            {Math.floor(hub.members * 0.02)}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>online</span>
                    </div>
                </div>
            </div>

            <div className="page-layout">
                <div>
                    {/* Back link */}
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-md)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)'
                        }}
                    >
                        <ArrowLeftIcon />
                        Back to feed
                    </Link>

                    {/* Feed Controls */}
                    <div className="feed-controls">
                        {sortOptions.map(option => (
                            <button
                                key={option.id}
                                className={`feed-sort-btn ${sortBy === option.id ? 'active' : ''}`}
                                onClick={() => setSortBy(option.id)}
                            >
                                <option.icon />
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {hubPosts.length > 0 ? (
                            hubPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: 'var(--space-3xl)',
                                background: 'var(--color-bg-card)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>📝</div>
                                <h3 style={{ marginBottom: 'var(--space-sm)' }}>No posts yet</h3>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                    Be the first to post in r/{hub.name}!
                                </p>
                                <button className="btn btn-primary" onClick={openCreateModal}>
                                    Create Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <Sidebar />
            </div>
        </div>
    )
}

export default HubPage
