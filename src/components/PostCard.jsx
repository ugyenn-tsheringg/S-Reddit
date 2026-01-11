import { useState } from 'react'
import { Link } from 'react-router-dom'
import VoteWidget from './VoteWidget'
import { useApp } from '../App'

// SVG Icons
const CommentIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

const ShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const BookmarkIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
)

const LocationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const GraduationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
)

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const ExternalLinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
)

function PostCard({ post }) {
    const { bookmarks, toggleBookmark } = useApp()
    const isBookmarked = bookmarks.includes(post.id)
    const [shareStatus, setShareStatus] = useState(null)

    // Format relative time - handle Firebase Timestamp
    const formatTime = (date) => {
        const now = new Date()
        const postDate = date?.toDate ? date.toDate() : new Date(date)
        const diffMs = now - postDate
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return postDate.toLocaleDateString()
    }

    // Format deadline - handle Firebase Timestamp
    const formatDeadline = (date) => {
        const deadline = date?.toDate ? date.toDate() : new Date(date)
        const now = new Date()
        const diffMs = deadline - now
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffDays < 0) return { text: 'Expired', class: '' }
        if (diffDays <= 3) return { text: `${diffDays}d left`, class: 'deadline-urgent' }
        if (diffDays <= 14) return { text: `${diffDays}d left`, class: 'deadline-soon' }
        return { text: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), class: '' }
    }

    // Get post type badge
    const getTypeBadge = () => {
        switch (post.type) {
            case 'scholarship':
                return <span className="badge badge-merit">Scholarship</span>
            case 'question':
                return <span className="badge badge-question">Question</span>
            case 'experience':
                return <span className="badge badge-experience">Experience</span>
            case 'discussion':
                return <span className="badge badge-discussion">Discussion</span>
            default:
                return null
        }
    }

    // Get tag badge class
    const getTagClass = (tag) => {
        const tagLower = tag.toLowerCase()
        if (tagLower.includes('stem')) return 'badge-stem'
        if (tagLower.includes('full ride') || tagLower.includes('fullride')) return 'badge-fullride'
        if (tagLower.includes('women')) return 'badge-women'
        if (tagLower.includes('first-gen') || tagLower.includes('firstgen')) return 'badge-firstgen'
        if (tagLower.includes('merit')) return 'badge-merit'
        if (tagLower.includes('need')) return 'badge-need'
        return ''
    }

    const handleBookmark = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark(post.id)
    }

    const handleShare = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        const url = `${window.location.origin}/post/${post.id}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    url: url
                })
            } catch (error) {
                if (error.name !== 'AbortError') {
                    copyToClipboard(url)
                }
            }
        } else {
            copyToClipboard(url)
        }
    }

    const copyToClipboard = async (url) => {
        try {
            await navigator.clipboard.writeText(url)
            setShareStatus('copied')
            setTimeout(() => setShareStatus(null), 2000)
        } catch (error) {
            const textarea = document.createElement('textarea')
            textarea.value = url
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setShareStatus('copied')
            setTimeout(() => setShareStatus(null), 2000)
        }
    }

    return (
        <article className="post-card">
            <div className="post-card-vote">
                <VoteWidget
                    votes={post.votes}
                    userVote={post.userVote}
                    postId={post.id}
                />
            </div>

            <div className="post-card-content">
                <div className="post-card-meta">
                    <Link to={`/hub/${encodeURIComponent(post.hub)}`} className="hub">
                        r/{post.hub}
                    </Link>
                    <span>•</span>
                    <span>Posted by {post.author}</span>
                    <span>•</span>
                    <span>{formatTime(post.createdAt)}</span>
                    {post.isUnanswered && (
                        <>
                            <span>•</span>
                            <span className="badge badge-question" style={{ marginLeft: 4 }}>Unanswered</span>
                        </>
                    )}
                </div>

                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="post-card-title">{post.title}</h3>
                </Link>

                {/* Scholarship-specific metadata */}
                {post.type === 'scholarship' && post.scholarship && (
                    <div className="scholarship-meta">
                        <div className="scholarship-meta-item">
                            <LocationIcon />
                            <span>{post.scholarship.country}</span>
                        </div>
                        <div className="scholarship-meta-item">
                            <GraduationIcon />
                            <span>{post.scholarship.degree}</span>
                        </div>
                        <div className="scholarship-meta-item">
                            <ClockIcon />
                            <span className={formatDeadline(post.scholarship.deadline).class}>
                                {formatDeadline(post.scholarship.deadline).text}
                            </span>
                        </div>
                    </div>
                )}

                <p className="post-card-preview">{post.content}</p>

                <div className="post-card-tags">
                    {getTypeBadge()}
                    {post.tags?.map((tag, index) => (
                        <span key={index} className={`badge ${getTagClass(tag)}`}>
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="post-card-actions">
                    <Link to={`/post/${post.id}`} className="post-action">
                        <CommentIcon />
                        <span>{post.comments} Comments</span>
                    </Link>

                    <button
                        className="post-action"
                        onClick={handleShare}
                        style={{ color: shareStatus === 'copied' ? 'var(--color-success)' : undefined }}
                    >
                        {shareStatus === 'copied' ? <CheckIcon /> : <ShareIcon />}
                        <span>{shareStatus === 'copied' ? 'Copied!' : 'Share'}</span>
                    </button>

                    <button
                        className={`post-action ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={handleBookmark}
                    >
                        <BookmarkIcon filled={isBookmarked} />
                        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>

                    {post.type === 'scholarship' && post.scholarship?.url && (
                        <a
                            href={post.scholarship.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="post-action"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLinkIcon />
                            <span>Apply</span>
                        </a>
                    )}
                </div>
            </div>
        </article>
    )
}

export default PostCard
