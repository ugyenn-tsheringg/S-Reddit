// Firestore Database Service for S Reddit
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    increment,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection references
const COLLECTIONS = {
    POSTS: 'posts',
    HUBS: 'hubs',
    COMMENTS: 'comments',
    USERS: 'users',
    BOOKMARKS: 'bookmarks',
    VOTES: 'votes'
};

// ============ POSTS ============

// Get all posts
export const getPosts = async () => {
    try {
        const postsRef = collection(db, COLLECTIONS.POSTS);
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error getting posts:', error);
        throw error;
    }
};

// Get a single post by ID
export const getPostById = async (postId) => {
    try {
        const postRef = doc(db, COLLECTIONS.POSTS, postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            return {
                id: postDoc.id,
                ...postDoc.data(),
                createdAt: postDoc.data().createdAt?.toDate() || new Date()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting post:', error);
        throw error;
    }
};

// Get posts by hub
export const getPostsByHub = async (hubName) => {
    try {
        const postsRef = collection(db, COLLECTIONS.POSTS);
        const q = query(
            postsRef,
            where('hub', '==', hubName),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error getting posts by hub:', error);
        throw error;
    }
};

// Create a new post
export const createPost = async (postData) => {
    try {
        const postsRef = collection(db, COLLECTIONS.POSTS);
        const newPost = {
            ...postData,
            votes: 0,
            comments: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Handle scholarship deadline
        if (postData.scholarship?.deadline) {
            newPost.scholarship = {
                ...postData.scholarship,
                deadline: Timestamp.fromDate(new Date(postData.scholarship.deadline))
            };
        }

        const docRef = await addDoc(postsRef, newPost);
        return { id: docRef.id, ...newPost, createdAt: new Date() };
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

// Update post votes
export const updatePostVotes = async (postId, voteChange) => {
    try {
        const postRef = doc(db, COLLECTIONS.POSTS, postId);
        await updateDoc(postRef, {
            votes: increment(voteChange),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating post votes:', error);
        throw error;
    }
};

// Increment comment count
export const incrementCommentCount = async (postId) => {
    try {
        const postRef = doc(db, COLLECTIONS.POSTS, postId);
        await updateDoc(postRef, {
            comments: increment(1),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error incrementing comment count:', error);
        throw error;
    }
};

// ============ HUBS ============

// Get all hubs
export const getHubs = async () => {
    try {
        const hubsRef = collection(db, COLLECTIONS.HUBS);
        const q = query(hubsRef, orderBy('members', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting hubs:', error);
        throw error;
    }
};

// Get hub by name
export const getHubByName = async (hubName) => {
    try {
        const hubsRef = collection(db, COLLECTIONS.HUBS);
        const q = query(hubsRef, where('name', '==', hubName));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting hub:', error);
        throw error;
    }
};

// ============ COMMENTS ============

// Get comments for a post
export const getCommentsByPostId = async (postId) => {
    try {
        const commentsRef = collection(db, COLLECTIONS.COMMENTS);
        const q = query(
            commentsRef,
            where('postId', '==', postId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('Error getting comments:', error);
        throw error;
    }
};

// Create a comment
export const createComment = async (commentData) => {
    try {
        const commentsRef = collection(db, COLLECTIONS.COMMENTS);
        const newComment = {
            ...commentData,
            votes: 0,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(commentsRef, newComment);

        // Increment post comment count
        await incrementCommentCount(commentData.postId);

        return { id: docRef.id, ...newComment, createdAt: new Date() };
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
};

// ============ BOOKMARKS ============

// Get user bookmarks
export const getBookmarks = async (userId) => {
    try {
        const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
        const q = query(bookmarksRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().postId);
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

// Toggle bookmark
export const toggleBookmark = async (userId, postId) => {
    try {
        const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
        const q = query(
            bookmarksRef,
            where('userId', '==', userId),
            where('postId', '==', postId)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Add bookmark
            await addDoc(bookmarksRef, {
                userId,
                postId,
                createdAt: serverTimestamp()
            });
            return true;
        } else {
            // Remove bookmark
            await deleteDoc(snapshot.docs[0].ref);
            return false;
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        throw error;
    }
};

// ============ VOTES ============

// Get user vote for a post
export const getUserVote = async (userId, postId) => {
    try {
        const votesRef = collection(db, COLLECTIONS.VOTES);
        const q = query(
            votesRef,
            where('userId', '==', userId),
            where('postId', '==', postId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].data().vote;
        }
        return 0;
    } catch (error) {
        console.error('Error getting user vote:', error);
        throw error;
    }
};

// Handle voting
export const handleVote = async (userId, postId, direction) => {
    try {
        const votesRef = collection(db, COLLECTIONS.VOTES);
        const q = query(
            votesRef,
            where('userId', '==', userId),
            where('postId', '==', postId)
        );
        const snapshot = await getDocs(q);

        let voteChange = direction;
        let newVote = direction;

        if (!snapshot.empty) {
            const existingVote = snapshot.docs[0].data().vote;

            if (existingVote === direction) {
                // Remove vote
                await deleteDoc(snapshot.docs[0].ref);
                voteChange = -direction;
                newVote = 0;
            } else {
                // Change vote
                await updateDoc(snapshot.docs[0].ref, { vote: direction });
                voteChange = direction * 2;
                newVote = direction;
            }
        } else {
            // New vote
            await addDoc(votesRef, {
                userId,
                postId,
                vote: direction,
                createdAt: serverTimestamp()
            });
        }

        // Update post vote count
        await updatePostVotes(postId, voteChange);

        return { newVote, voteChange };
    } catch (error) {
        console.error('Error handling vote:', error);
        throw error;
    }
};

// ============ REAL-TIME LISTENERS ============

// Subscribe to posts updates
export const subscribeToPost = (postId, callback) => {
    const postRef = doc(db, COLLECTIONS.POSTS, postId);
    return onSnapshot(postRef, (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            });
        }
    });
};

// Subscribe to all posts
export const subscribeToPosts = (callback) => {
    const postsRef = collection(db, COLLECTIONS.POSTS);
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        callback(posts);
    });
};

export { COLLECTIONS };
