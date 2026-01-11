import { Link } from 'react-router-dom'
import { useApp } from '../App'

// SVG Icons
const TrendingIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

// Database Icon
const DatabaseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
)

function Sidebar() {
    const { hubs, posts, openCreateModal, seedDatabase, isSeeding } = useApp()

    // Calculate stats
    const totalMembers = hubs.reduce((sum, hub) => sum + (hub.members || 0), 0)
    const totalPosts = posts.length

    // Get trending hubs (top 5 by members)
    const trendingHubs = [...hubs].sort((a, b) => (b.members || 0) - (a.members || 0)).slice(0, 5)

    // Get upcoming deadlines (scholarship posts)
    const upcomingDeadlines = posts
        .filter(p => p.type === 'scholarship' && p.scholarship?.deadline)
        .map(p => ({
            id: p.id,
            title: p.title,
            deadline: p.scholarship.deadline?.toDate ? p.scholarship.deadline.toDate() : new Date(p.scholarship.deadline)
        }))
        .filter(p => p.deadline > new Date())
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 3)

    const formatDeadline = (date) => {
        const now = new Date()
        const diffDays = Math.floor((date - now) / 86400000)

        if (diffDays <= 3) return { text: `${diffDays}d left`, class: 'deadline-urgent' }
        if (diffDays <= 14) return { text: `${diffDays}d left`, class: 'deadline-soon' }
        return {
            text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            class: ''
        }
    }

    // Check if database needs seeding
    const needsSeeding = hubs.length === 0 && posts.length === 0

    return (
        <aside className="sidebar">
            {/* Seed Database Card - Only show when empty */}
            {needsSeeding && (
                <div className="sidebar-card" style={{ border: '2px dashed var(--color-primary)' }}>
                    <div className="sidebar-card-header" style={{
                        background: 'linear-gradient(135deg, var(--color-success), #2ECC71)'
                    }}>
                        <h3>🌱 Setup Database</h3>
                    </div>
                    <div className="sidebar-card-content">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                            Your Firebase database is empty. Click below to populate it with sample scholarship data.
                        </p>
                        <button
                            className="btn btn-primary w-full"
                            onClick={seedDatabase}
                            disabled={isSeeding}
                            style={{ gap: 'var(--space-sm)' }}
                        >
                            <DatabaseIcon />
                            {isSeeding ? 'Seeding...' : 'Seed Database'}
                        </button>
                    </div>
                </div>
            )}

            {/* About Card */}
            <div className="sidebar-card">
                <div className="sidebar-card-header">
                    <h3>Welcome to S Reddit</h3>
                </div>
                <div className="sidebar-card-content">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                        The trusted community for scholarship seekers. Ask questions, share experiences, and discover opportunities.
                    </p>
                    <div className="sidebar-stats">
                        <div>
                            <div className="sidebar-stat-value">{totalMembers > 0 ? (totalMembers / 1000).toFixed(1) + 'k' : '0'}</div>
                            <div className="sidebar-stat-label">Members</div>
                        </div>
                        <div>
                            <div className="sidebar-stat-value">{totalPosts}</div>
                            <div className="sidebar-stat-label">Posts</div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-sm w-full mt-md"
                        onClick={openCreateModal}
                        style={{ padding: 'var(--space-sm) var(--space-md)' }}
                    >
                        <PlusIcon />
                        Create Post
                    </button>
                </div>
            </div>

            {/* Trending Hubs */}
            <div className="sidebar-card">
                <div className="sidebar-card-header" style={{
                    background: 'linear-gradient(135deg, #1A1A1B, #2D2D2E)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)'
                }}>
                    <TrendingIcon />
                    <h3>Trending Hubs</h3>
                </div>
                <div className="sidebar-card-content" style={{ padding: 'var(--space-sm)' }}>
                    <div className="hubs-list">
                        {trendingHubs.map((hub, index) => (
                            <Link
                                key={hub.id}
                                to={`/hub/${encodeURIComponent(hub.name)}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="hub-item">
                                    <span style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-tertiary)',
                                        width: '20px'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div className="hub-icon">{hub.icon}</div>
                                    <div className="hub-info">
                                        <div className="hub-name">r/{hub.name}</div>
                                        <div className="hub-members">{hub.members.toLocaleString()} members</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link
                        to="/hubs"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: 'var(--space-sm)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-info)',
                            marginTop: 'var(--space-sm)'
                        }}
                    >
                        View All Hubs
                    </Link>
                </div>
            </div>

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
                <div className="sidebar-card">
                    <div className="sidebar-card-header" style={{
                        background: 'linear-gradient(135deg, var(--color-warning), #FF9500)'
                    }}>
                        <h3>⏰ Upcoming Deadlines</h3>
                    </div>
                    <div className="sidebar-card-content">
                        {upcomingDeadlines.map(item => {
                            const deadline = formatDeadline(item.deadline)
                            return (
                                <Link
                                    key={item.id}
                                    to={`/post/${item.id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        padding: 'var(--space-sm)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-sm)',
                                        transition: 'background var(--transition-fast)'
                                    }}
                                        className="hub-item"
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--color-text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginBottom: '2px'
                                            }}>
                                                {item.title}
                                            </div>
                                            <div className={deadline.class} style={{ fontSize: 'var(--font-size-xs)' }}>
                                                {deadline.text}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="sidebar-card">
                <div className="sidebar-card-content">
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-sm)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>About</a>
                        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Help</a>
                        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Privacy</a>
                        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Terms</a>
                        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Contact</a>
                    </div>
                    <div style={{
                        marginTop: 'var(--space-md)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-tertiary)'
                    }}>
                        © 2026 S Reddit. Made with ❤️ for scholars.
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
