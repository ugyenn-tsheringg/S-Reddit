import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import PostCard from '../components/PostCard'
import Sidebar from '../components/Sidebar'

// SVG Icons
const HotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10z" />
        <path d="M12 22c-4 0-6-3-6-6 0-4 4-6 6-10 2 4 6 6 6 10 0 3-2 6-6 6z" />
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

const UnansweredIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
)

const LinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
)

const sortOptions = [
    { id: 'hot', label: 'Hot', icon: HotIcon },
    { id: 'new', label: 'New', icon: NewIcon },
    { id: 'top', label: 'Top', icon: TopIcon },
    { id: 'unanswered', label: 'Unanswered', icon: UnansweredIcon }
]

function HomePage() {
    const { posts, openCreateModal } = useApp()
    const [searchParams] = useSearchParams()
    const [sortBy, setSortBy] = useState('hot')
    const [filterType, setFilterType] = useState('all')

    const searchQuery = searchParams.get('search')?.toLowerCase() || ''

    // Sort and filter posts
    const filteredPosts = useMemo(() => {
        let result = [...posts]

        // Apply search filter
        if (searchQuery) {
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchQuery) ||
                post.content.toLowerCase().includes(searchQuery) ||
                post.hub.toLowerCase().includes(searchQuery) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
            )
        }

        // Apply type filter
        if (filterType !== 'all') {
            result = result.filter(post => post.type === filterType)
        }

        // Apply sorting
        switch (sortBy) {
            case 'hot':
                // Hot = combination of votes and recency
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
            case 'unanswered':
                result = result.filter(post => post.isUnanswered || post.comments === 0)
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
        }

        return result
    }, [posts, sortBy, filterType, searchQuery])

    return (
        <div className="container">
            <div className="page-layout">
                <div className="feed">
                    {/* Create Post Bar */}
                    <div className="create-post-bar">
                        <div className="create-post-avatar"></div>
                        <input
                            type="text"
                            className="create-post-input"
                            placeholder="Create a post..."
                            onClick={openCreateModal}
                            readOnly
                        />
                        <div className="create-post-actions">
                            <button
                                className="btn btn-icon btn-ghost"
                                onClick={openCreateModal}
                                aria-label="Add image"
                            >
                                <ImageIcon />
                            </button>
                            <button
                                className="btn btn-icon btn-ghost"
                                onClick={openCreateModal}
                                aria-label="Add link"
                            >
                                <LinkIcon />
                            </button>
                        </div>
                    </div>

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

                        <div style={{ marginLeft: 'auto' }}>
                            <select
                                className="form-input form-select"
                                style={{
                                    padding: 'var(--space-xs) var(--space-md)',
                                    fontSize: 'var(--font-size-sm)',
                                    background: 'transparent',
                                    border: 'none'
                                }}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Posts</option>
                                <option value="scholarship">Scholarships</option>
                                <option value="question">Questions</option>
                                <option value="experience">Experiences</option>
                                <option value="discussion">Discussions</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Results Header */}
                    {searchQuery && (
                        <div style={{
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-md)',
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Search results for:
                            </span>
                            <strong style={{ marginLeft: 'var(--space-xs)' }}>"{searchQuery}"</strong>
                            <span style={{
                                marginLeft: 'var(--space-sm)',
                                color: 'var(--color-text-tertiary)'
                            }}>
                                ({filteredPosts.length} results)
                            </span>
                        </div>
                    )}

                    {/* Posts Feed */}
                    <div className="posts-feed" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
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
                                <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔍</div>
                                <h3 style={{ marginBottom: 'var(--space-sm)' }}>No posts found</h3>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                    {searchQuery
                                        ? 'Try adjusting your search terms'
                                        : 'Be the first to create a post!'
                                    }
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

export default HomePage
