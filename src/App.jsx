import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import HubPage from './pages/HubPage'
import CreatePostModal from './components/CreatePostModal'
import AuthModal from './components/AuthModal'
import { AuthProvider, useAuth } from './context/AuthContext'

// Firebase imports
import {
    getPosts,
    getHubs,
    createPost as createPostDB,
    handleVote as handleVoteDB,
    toggleBookmark as toggleBookmarkDB,
    getBookmarks,
    subscribeToPosts
} from './firebase/database'
import { seedDatabase } from './firebase/seed'

// App Context for global state
export const AppContext = createContext()

// Generate a simple anonymous user ID (persisted in localStorage)
const getOrCreateUserId = () => {
    let userId = localStorage.getItem('s-reddit-user-id')
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
        localStorage.setItem('s-reddit-user-id', userId)
    }
    return userId
}

export function useApp() {
    return useContext(AppContext)
}

function App() {
    const [posts, setPosts] = useState([])
    const [hubs, setHubs] = useState([])
    const [bookmarks, setBookmarks] = useState([])
    const [userVotes, setUserVotes] = useState({}) // { postId: voteDirection }
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSeeding, setIsSeeding] = useState(false)

    const userId = getOrCreateUserId()

    // Load initial data from Firebase
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Load hubs and posts in parallel
                const [hubsData, postsData, bookmarksData] = await Promise.all([
                    getHubs(),
                    getPosts(),
                    getBookmarks(userId)
                ])

                setHubs(hubsData)
                setPosts(postsData)
                setBookmarks(bookmarksData)

                // Load user votes from localStorage (for performance)
                const savedVotes = localStorage.getItem('s-reddit-votes')
                if (savedVotes) {
                    setUserVotes(JSON.parse(savedVotes))
                }

            } catch (err) {
                console.error('Error loading data:', err)
                setError('Failed to load data. Please check your connection.')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [userId])

    // Subscribe to real-time updates for posts
    useEffect(() => {
        const unsubscribe = subscribeToPosts((updatedPosts) => {
            setPosts(updatedPosts)
        })

        return () => unsubscribe()
    }, [])

    // Save user votes to localStorage
    useEffect(() => {
        localStorage.setItem('s-reddit-votes', JSON.stringify(userVotes))
    }, [userVotes])

    // Seed database function
    const handleSeedDatabase = async () => {
        try {
            setIsSeeding(true)
            const result = await seedDatabase()

            if (result.success) {
                // Reload data after seeding
                const [hubsData, postsData] = await Promise.all([
                    getHubs(),
                    getPosts()
                ])
                setHubs(hubsData)
                setPosts(postsData)
                alert(`Database seeded successfully!\n${result.stats.hubs} hubs, ${result.stats.posts} posts, ${result.stats.comments} comments created.`)
            } else {
                alert(result.message)
            }
        } catch (err) {
            console.error('Error seeding database:', err)
            alert('Error seeding database: ' + err.message)
        } finally {
            setIsSeeding(false)
        }
    }

    // Add a new post
    const addPost = async (postData) => {
        try {
            const newPost = await createPostDB({
                ...postData,
                author: postData.isPseudonymous ? postData.pseudonym : 'Anonymous',
                authorId: postData.isPseudonymous ? `user_${userId}` : `anon_${Date.now()}`
            })

            // Optimistically update UI
            setPosts(prev => [{ ...newPost, userVote: 0 }, ...prev])
            setIsCreateModalOpen(false)

            return newPost
        } catch (err) {
            console.error('Error creating post:', err)
            alert('Failed to create post. Please try again.')
            throw err
        }
    }

    // Vote on a post
    const votePost = useCallback(async (postId, direction) => {
        const currentVote = userVotes[postId] || 0

        // Calculate new vote state
        let newVote = direction
        let voteDiff = direction

        if (currentVote === direction) {
            newVote = 0
            voteDiff = -direction
        } else if (currentVote !== 0) {
            voteDiff = direction * 2
        }

        // Optimistically update UI
        setUserVotes(prev => ({ ...prev, [postId]: newVote }))
        setPosts(prev => prev.map(post => {
            if (post.id !== postId) return post
            return { ...post, votes: post.votes + voteDiff, userVote: newVote }
        }))

        try {
            // Sync with Firebase
            await handleVoteDB(userId, postId, direction)
        } catch (err) {
            console.error('Error voting:', err)
            // Revert on error
            setUserVotes(prev => ({ ...prev, [postId]: currentVote }))
            setPosts(prev => prev.map(post => {
                if (post.id !== postId) return post
                return { ...post, votes: post.votes - voteDiff, userVote: currentVote }
            }))
        }
    }, [userId, userVotes])

    // Toggle bookmark
    const toggleBookmark = useCallback(async (postId) => {
        const isCurrentlyBookmarked = bookmarks.includes(postId)

        // Optimistically update UI
        setBookmarks(prev =>
            isCurrentlyBookmarked
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        )

        try {
            await toggleBookmarkDB(userId, postId)
        } catch (err) {
            console.error('Error toggling bookmark:', err)
            // Revert on error
            setBookmarks(prev =>
                isCurrentlyBookmarked
                    ? [...prev, postId]
                    : prev.filter(id => id !== postId)
            )
        }
    }, [userId, bookmarks])

    // Merge userVotes with posts for display
    const postsWithVotes = posts.map(post => ({
        ...post,
        userVote: userVotes[post.id] || 0
    }))

    const contextValue = {
        posts: postsWithVotes,
        hubs,
        bookmarks,
        userId,
        isLoading,
        error,
        isSeeding,
        addPost,
        votePost,
        toggleBookmark,
        seedDatabase: handleSeedDatabase,
        openCreateModal: () => setIsCreateModalOpen(true),
        closeCreateModal: () => setIsCreateModalOpen(false)
    }

    return (
        <AuthProvider>
            <AppContext.Provider value={contextValue}>
                <AppContent
                    isLoading={isLoading}
                    error={error}
                    isCreateModalOpen={isCreateModalOpen}
                />
            </AppContext.Provider>
        </AuthProvider>
    )
}

// AppContent component - needs to be inside AuthProvider to use useAuth
function AppContent({ isLoading, error, isCreateModalOpen }) {
    const { authModalOpen } = useAuth()

    return (
        <div className="app">
            <Header />
            <main>
                {isLoading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '50vh',
                        flexDirection: 'column',
                        gap: 'var(--space-md)'
                    }}>
                        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Loading S Reddit...</p>
                    </div>
                ) : error ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '50vh',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        textAlign: 'center',
                        padding: 'var(--space-xl)'
                    }}>
                        <div style={{ fontSize: 48 }}>⚠️</div>
                        <h2>Connection Error</h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/post/:id" element={<PostPage />} />
                        <Route path="/hub/:name" element={<HubPage />} />
                    </Routes>
                )}
            </main>
            {isCreateModalOpen && <CreatePostModal />}
            {authModalOpen && <AuthModal />}
        </div>
    )
}

export default App
