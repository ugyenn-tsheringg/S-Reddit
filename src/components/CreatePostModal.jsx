import { useState } from 'react'
import { useApp } from '../App'

// SVG Icons
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const QuestionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const ScholarshipIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
)

const ExperienceIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const DiscussionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
)

const postTypes = [
    { id: 'question', label: 'Question', icon: QuestionIcon },
    { id: 'scholarship', label: 'Scholarship', icon: ScholarshipIcon },
    { id: 'experience', label: 'Experience', icon: ExperienceIcon },
    { id: 'discussion', label: 'Discussion', icon: DiscussionIcon }
]

const hubOptions = [
    'Graduate Studies',
    'Undergraduate',
    'STEM Majors',
    'Essay Tips',
    'Success Stories',
    'Women in Education',
    'First Generation',
    'Resources'
]

const tagOptions = [
    'Full Ride', 'STEM', 'Merit', 'Need-Based', 'Women', 'First-Gen',
    'Graduate', 'Undergraduate', 'PhD', 'Masters', 'Bachelors',
    'USA', 'UK', 'Germany', 'Canada', 'Australia', 'Europe', 'Asia'
]

const degreeOptions = [
    'Bachelors',
    'Masters',
    'PhD',
    'Masters/PhD',
    'Bachelors/Masters/PhD',
    'Postdoctoral'
]

function CreatePostModal() {
    const { closeCreateModal, addPost, hubs } = useApp()
    const [postType, setPostType] = useState('question')
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        hub: hubOptions[0],
        tags: [],
        isPseudonymous: false,
        pseudonym: '',
        // Scholarship-specific fields
        country: '',
        degree: degreeOptions[0],
        deadline: '',
        provider: '',
        eligibility: '',
        url: ''
    })
    const [tagInput, setTagInput] = useState('')

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleTagAdd = (tag) => {
        if (!formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }))
        }
        setTagInput('')
    }

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            handleTagAdd(tagInput.trim())
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const post = {
            type: postType,
            title: formData.title,
            content: formData.content,
            hub: formData.hub,
            tags: formData.tags,
            isPseudonymous: formData.isPseudonymous,
            pseudonym: formData.pseudonym
        }

        if (postType === 'scholarship') {
            post.scholarship = {
                country: formData.country,
                degree: formData.degree,
                deadline: new Date(formData.deadline),
                provider: formData.provider,
                eligibility: formData.eligibility,
                url: formData.url
            }
        }

        addPost(post)
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeCreateModal()
        }
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Create a Post</h2>
                    <button className="modal-close" onClick={closeCreateModal} aria-label="Close">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Post Type Tabs */}
                    <div className="post-type-tabs">
                        {postTypes.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                className={`post-type-tab ${postType === type.id ? 'active' : ''}`}
                                onClick={() => setPostType(type.id)}
                            >
                                <type.icon />
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="modal-body">
                        {/* Hub Selection */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="hub">Community Hub</label>
                            <select
                                id="hub"
                                name="hub"
                                className="form-input form-select"
                                value={formData.hub}
                                onChange={handleChange}
                            >
                                {hubOptions.map(hub => (
                                    <option key={hub} value={hub}>{hub}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                placeholder={postType === 'scholarship' ? 'e.g., Fulbright Scholarship 2026 - Full Funding' : 'e.g., How do I write a strong SOP?'}
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Scholarship-specific fields */}
                        {postType === 'scholarship' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="country">Country</label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            className="form-input"
                                            placeholder="e.g., United States"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="degree">Degree Level</label>
                                        <select
                                            id="degree"
                                            name="degree"
                                            className="form-input form-select"
                                            value={formData.degree}
                                            onChange={handleChange}
                                        >
                                            {degreeOptions.map(degree => (
                                                <option key={degree} value={degree}>{degree}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="deadline">Application Deadline</label>
                                        <input
                                            type="date"
                                            id="deadline"
                                            name="deadline"
                                            className="form-input"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="provider">Provider/Organization</label>
                                        <input
                                            type="text"
                                            id="provider"
                                            name="provider"
                                            className="form-input"
                                            placeholder="e.g., U.S. Department of State"
                                            value={formData.provider}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="eligibility">Eligibility Summary</label>
                                    <input
                                        type="text"
                                        id="eligibility"
                                        name="eligibility"
                                        className="form-input"
                                        placeholder="e.g., International students with Bachelor's degree"
                                        value={formData.eligibility}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="url">Application URL</label>
                                    <input
                                        type="url"
                                        id="url"
                                        name="url"
                                        className="form-input"
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        {/* Content */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="content">
                                {postType === 'scholarship' ? 'Description' : 'Content'}
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                className="form-input form-textarea"
                                placeholder={postType === 'scholarship'
                                    ? 'Describe the scholarship, benefits, and any important details...'
                                    : postType === 'question'
                                        ? 'Provide details about your question...'
                                        : postType === 'experience'
                                            ? 'Share your experience and tips...'
                                            : 'Start your discussion...'}
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label className="form-label">Tags</label>
                            <div className="tags-input-container">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="tag-chip">
                                        {tag}
                                        <button
                                            type="button"
                                            className="tag-chip-remove"
                                            onClick={() => handleTagRemove(tag)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    className="tags-input"
                                    placeholder="Add tags..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                                {tagOptions.filter(tag => !formData.tags.includes(tag)).slice(0, 8).map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className="badge"
                                        style={{ cursor: 'pointer', opacity: 0.7 }}
                                        onClick={() => handleTagAdd(tag)}
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Identity Options */}
                        <div className="form-group">
                            <label className="form-label">Identity</label>
                            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="isPseudonymous"
                                        checked={!formData.isPseudonymous}
                                        onChange={() => setFormData(prev => ({ ...prev, isPseudonymous: false }))}
                                    />
                                    <span>Post Anonymously</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="isPseudonymous"
                                        checked={formData.isPseudonymous}
                                        onChange={() => setFormData(prev => ({ ...prev, isPseudonymous: true }))}
                                    />
                                    <span>Use Pseudonym</span>
                                </label>
                            </div>

                            {formData.isPseudonymous && (
                                <input
                                    type="text"
                                    name="pseudonym"
                                    className="form-input"
                                    style={{ marginTop: 'var(--space-sm)' }}
                                    placeholder="Enter your pseudonym..."
                                    value={formData.pseudonym}
                                    onChange={handleChange}
                                    required={formData.isPseudonymous}
                                />
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={closeCreateModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePostModal
