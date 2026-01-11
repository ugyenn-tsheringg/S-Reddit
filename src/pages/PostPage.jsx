import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../App'
import { useAuth } from '../context/AuthContext'
import VoteWidget from '../components/VoteWidget'
import Sidebar from '../components/Sidebar'
import { getCommentsByPostId, createComment } from '../firebase/database'

// SVG Icons
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

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

const ReplyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
)

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
)

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

function Comment({ comment, depth = 0, postId, onReplyAdded }) {
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [localVote, setLocalVote] = useState(comment.userVote || 0)
    const [votes, setVotes] = useState(comment.votes || 0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { currentUser, userProfile, openAuthModal } = useAuth()

    const formatTime = (date) => {
        const now = new Date()
        const commentDate = date?.toDate ? date.toDate() : new Date(date)
        const diffMs = now - commentDate
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return commentDate.toLocaleDateString()
    }

    const handleVote = (direction) => {
        if (localVote === direction) {
            setVotes(v => v - direction)
            setLocalVote(0)
        } else if (localVote !== 0) {
            setVotes(v => v + direction * 2)
            setLocalVote(direction)
        } else {
            setVotes(v => v + direction)
            setLocalVote(direction)
        }
    }

    const handleReply = async () => {
        if (!currentUser) {
            openAuthModal('login')
            return
        }

        if (!replyContent.trim()) return

        setIsSubmitting(true)
        try {
            await createComment({
                postId,
                parentId: comment.id,
                author: userProfile?.username || currentUser.displayName || 'Anonymous',
                authorId: currentUser.uid,
                content: replyContent.trim()
            })
            setReplyContent('')
            setIsReplying(false)
            if (onReplyAdded) onReplyAdded()
        } catch (error) {
            console.error('Error posting reply:', error)
            alert('Failed to post reply. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="comment" style={{
            marginLeft: depth > 0 ? 'var(--space-lg)' : 0,
            borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none',
            paddingLeft: depth > 0 ? 'var(--space-md)' : 0,
            marginTop: 'var(--space-md)'
        }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {/* Mini vote widget */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    <button
                        onClick={() => handleVote(1)}
                        style={{
                            color: localVote === 1 ? 'var(--color-upvote)' : 'var(--color-vote-neutral)',
                            fontSize: '12px',
                            padding: '2px'
                        }}
                    >
                        ▲
                    </button>
                    <span style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: localVote === 1 ? 'var(--color-upvote)' : localVote === -1 ? 'var(--color-downvote)' : 'var(--color-text-primary)'
                    }}>
                        {votes}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        style={{
                            color: localVote === -1 ? 'var(--color-downvote)' : 'var(--color-vote-neutral)',
                            fontSize: '12px',
                            padding: '2px'
                        }}
                    >
                        ▼
                    </button>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-xs)'
                    }}>
                        <span style={{
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--font-size-sm)',
                            color: comment.author === 'Anonymous' ? 'var(--color-text-secondary)' : 'var(--color-info)'
                        }}>
                            {comment.author}
                        </span>
                        <span style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-tertiary)'
                        }}>
                            • {formatTime(comment.createdAt)}
                        </span>
                    </div>

                    <p style={{
                        fontSize: 'var(--font-size-md)',
                        lineHeight: 'var(--line-height-normal)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-sm)'
                    }}>
                        {comment.content}
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <button
                            className="post-action"
                            onClick={() => {
                                if (!currentUser) {
                                    openAuthModal('login')
                                    return
                                }
                                setIsReplying(!isReplying)
                            }}
                        >
                            <ReplyIcon />
                            Reply
                        </button>
                    </div>

                    {isReplying && (
                        <div style={{ marginTop: 'var(--space-sm)' }}>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                style={{ minHeight: '80px' }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 'var(--space-sm)',
                                marginTop: 'var(--space-sm)'
                            }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setIsReplying(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleReply}
                                    disabled={isSubmitting || !replyContent.trim()}
                                >
                                    {isSubmitting ? 'Posting...' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nested replies */}
                    {comment.replies?.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            postId={postId}
                            onReplyAdded={onReplyAdded}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function PostPage() {
    const { id } = useParams()
    const { posts, bookmarks, toggleBookmark } = useApp()
    const { currentUser, userProfile, openAuthModal } = useAuth()
    const [commentContent, setCommentContent] = useState('')
    const [comments, setComments] = useState([])
    const [isLoadingComments, setIsLoadingComments] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [shareStatus, setShareStatus] = useState(null) // 'copied' or null

    // Find post - compare as string since Firebase uses string IDs
    const post = posts.find(p => p.id === id || p.id === parseInt(id))
    const isBookmarked = post ? bookmarks.includes(post.id) : false

    // Load comments from Firebase
    useEffect(() => {
        const loadComments = async () => {
            if (!id) return

            setIsLoadingComments(true)
            try {
                const commentsData = await getCommentsByPostId(id)

                // Organize comments into a tree structure
                const commentMap = {}
                const rootComments = []

                commentsData.forEach(comment => {
                    commentMap[comment.id] = { ...comment, replies: [] }
                })

                commentsData.forEach(comment => {
                    if (comment.parentId && commentMap[comment.parentId]) {
                        commentMap[comment.parentId].replies.push(commentMap[comment.id])
                    } else if (!comment.parentId) {
                        rootComments.push(commentMap[comment.id])
                    }
                })

                setComments(rootComments)
            } catch (error) {
                console.error('Error loading comments:', error)
            } finally {
                setIsLoadingComments(false)
            }
        }

        loadComments()
    }, [id])

    const handleSubmitComment = async () => {
        if (!currentUser) {
            openAuthModal('login')
            return
        }

        if (!commentContent.trim()) return

        setIsSubmitting(true)
        try {
            const newComment = await createComment({
                postId: id,
                parentId: null,
                author: userProfile?.username || currentUser.displayName || 'Anonymous',
                authorId: currentUser.uid,
                content: commentContent.trim()
            })

            setComments(prev => [{ ...newComment, replies: [] }, ...prev])
            setCommentContent('')
        } catch (error) {
            console.error('Error posting comment:', error)
            alert('Failed to post comment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleShare = async () => {
        const url = window.location.href

        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title || 'S Reddit Post',
                    url: url
                })
            } catch (error) {
                // User cancelled or error
                if (error.name !== 'AbortError') {
                    fallbackCopy(url)
                }
            }
        } else {
            fallbackCopy(url)
        }
    }

    const fallbackCopy = async (url) => {
        try {
            await navigator.clipboard.writeText(url)
            setShareStatus('copied')
            setTimeout(() => setShareStatus(null), 2000)
        } catch (error) {
            // Fallback for older browsers
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

    const refreshComments = async () => {
        const commentsData = await getCommentsByPostId(id)
        const commentMap = {}
        const rootComments = []

        commentsData.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] }
        })

        commentsData.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies.push(commentMap[comment.id])
            } else if (!comment.parentId) {
                rootComments.push(commentMap[comment.id])
            }
        })

        setComments(rootComments)
    }

    if (!post) {
        return (
            <div className="container">
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-3xl)',
                    marginTop: 'var(--space-xl)'
                }}>
                    <h2>Post not found</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
                        The post you're looking for doesn't exist or has been removed.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const formatTime = (date) => {
        const postDate = date?.toDate ? date.toDate() : new Date(date)
        return postDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDeadline = (date) => {
        const deadline = date?.toDate ? date.toDate() : new Date(date)
        const now = new Date()
        const diffMs = deadline - now
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffDays < 0) return { text: 'Expired', class: '' }
        if (diffDays <= 3) return { text: `${diffDays} days left`, class: 'deadline-urgent' }
        if (diffDays <= 14) return { text: `${diffDays} days left`, class: 'deadline-soon' }
        return {
            text: deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            class: ''
        }
    }

    const getTagClass = (tag) => {
        const tagLower = tag.toLowerCase()
        if (tagLower.includes('stem')) return 'badge-stem'
        if (tagLower.includes('full ride') || tagLower.includes('fullride')) return 'badge-fullride'
        if (tagLower.includes('women')) return 'badge-women'
        if (tagLower.includes('first-gen')) return 'badge-firstgen'
        if (tagLower.includes('merit')) return 'badge-merit'
        return ''
    }

    return (
        <div className="container">
            <div className="page-layout">
                <div>
                    {/* Back button */}
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

                    {/* Post Content */}
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
                            </div>

                            <h1 style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--space-md)',
                                lineHeight: 'var(--line-height-tight)'
                            }}>
                                {post.title}
                            </h1>

                            {/* Scholarship Info Box */}
                            {post.type === 'scholarship' && post.scholarship && (
                                <div style={{
                                    background: 'var(--color-bg-main)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-md)',
                                    marginBottom: 'var(--space-lg)'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: 'var(--space-md)'
                                    }}>
                                        <div className="scholarship-meta-item">
                                            <LocationIcon />
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Country</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{post.scholarship.country}</div>
                                            </div>
                                        </div>
                                        <div className="scholarship-meta-item">
                                            <GraduationIcon />
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Degree</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{post.scholarship.degree}</div>
                                            </div>
                                        </div>
                                        <div className="scholarship-meta-item">
                                            <ClockIcon />
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Deadline</div>
                                                <div className={formatDeadline(post.scholarship.deadline).class} style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {formatDeadline(post.scholarship.deadline).text}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {post.scholarship.provider && (
                                        <div style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
                                            <strong>Provider:</strong> {post.scholarship.provider}
                                        </div>
                                    )}

                                    {post.scholarship.eligibility && (
                                        <div style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-sm)' }}>
                                            <strong>Eligibility:</strong> {post.scholarship.eligibility}
                                        </div>
                                    )}

                                    {post.scholarship.url && (
                                        <a
                                            href={post.scholarship.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ marginTop: 'var(--space-md)' }}
                                        >
                                            <ExternalLinkIcon />
                                            Apply Now
                                        </a>
                                    )}
                                </div>
                            )}

                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                lineHeight: 'var(--line-height-relaxed)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--space-lg)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {post.content}
                            </p>

                            <div className="post-card-tags" style={{ marginBottom: 'var(--space-lg)' }}>
                                {post.tags?.map((tag, index) => (
                                    <span key={index} className={`badge ${getTagClass(tag)}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="post-card-actions">
                                <span className="post-action">
                                    <CommentIcon />
                                    <span>{comments.length || post.comments || 0} Comments</span>
                                </span>

                                <button
                                    className="post-action"
                                    onClick={handleShare}
                                    style={{
                                        color: shareStatus === 'copied' ? 'var(--color-success)' : undefined
                                    }}
                                >
                                    {shareStatus === 'copied' ? <CheckIcon /> : <ShareIcon />}
                                    <span>{shareStatus === 'copied' ? 'Copied!' : 'Share'}</span>
                                </button>

                                <button
                                    className="post-action"
                                    onClick={() => toggleBookmark(post.id)}
                                >
                                    <BookmarkIcon filled={isBookmarked} />
                                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Comment Box */}
                    <div className="card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)' }}>
                        <textarea
                            className="form-input form-textarea"
                            placeholder={currentUser ? "What are your thoughts?" : "Log in to comment..."}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            onClick={() => !currentUser && openAuthModal('login')}
                            style={{ marginBottom: 'var(--space-sm)' }}
                            disabled={!currentUser}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitComment}
                                disabled={isSubmitting || !commentContent.trim()}
                            >
                                {isSubmitting ? 'Posting...' : 'Comment'}
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Comments</h3>

                        {isLoadingComments ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-secondary)' }}>
                                Loading comments...
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    comment={comment}
                                    postId={id}
                                    onReplyAdded={refreshComments}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-secondary)' }}>
                                No comments yet. Be the first to share your thoughts!
                            </div>
                        )}
                    </div>
                </div>

                <Sidebar />
            </div>
        </div>
    )
}

export default PostPage
