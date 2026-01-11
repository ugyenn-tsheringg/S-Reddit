import { useApp } from '../App'

// SVG Icons
const UpvoteIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4 L4 14 L9 14 L9 20 L15 20 L15 14 L20 14 Z" />
    </svg>
)

const DownvoteIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20 L4 10 L9 10 L9 4 L15 4 L15 10 L20 10 Z" />
    </svg>
)

function VoteWidget({ votes, userVote, postId, size = 'normal' }) {
    const { votePost } = useApp()

    const formatVotes = (num) => {
        if (Math.abs(num) >= 1000) {
            return (num / 1000).toFixed(1) + 'k'
        }
        return num.toString()
    }

    const handleVote = (direction, e) => {
        e.preventDefault()
        e.stopPropagation()
        votePost(postId, direction)
    }

    return (
        <div className={`vote-widget ${size === 'small' ? 'vote-widget-sm' : ''}`}>
            <button
                className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`}
                onClick={(e) => handleVote(1, e)}
                aria-label="Upvote"
            >
                <UpvoteIcon filled={userVote === 1} />
            </button>

            <span className={`vote-count ${userVote === 1 ? 'upvoted' : ''} ${userVote === -1 ? 'downvoted' : ''}`}>
                {formatVotes(votes)}
            </span>

            <button
                className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
                onClick={(e) => handleVote(-1, e)}
                aria-label="Downvote"
            >
                <DownvoteIcon filled={userVote === -1} />
            </button>
        </div>
    )
}

export default VoteWidget
