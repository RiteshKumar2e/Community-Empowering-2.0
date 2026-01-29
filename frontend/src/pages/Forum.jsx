import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
    MessageSquare,
    Plus,
    Search,
    TrendingUp,
    Clock,
    MessageCircle,
    Eye,
    ThumbsUp,
    Filter,
    Users,
    BarChart3,
    Star,
    X,
    ChevronDown,
    Pin,
    CheckCircle2
} from 'lucide-react'
import { useRef } from 'react'
import LiveChat from '../components/LiveChat'
import '../styles/Forum.css'

const Forum = () => {
    const { user } = useAuth()
    const [categories, setCategories] = useState([
        { id: 1, name: "Community Support", icon: "🤝", color: "#6366f1" },
        { id: 2, name: "Social Impact", icon: "❤️", color: "#f59e0b" },
        { id: 3, name: "Local Resources", icon: "📍", color: "#10b981" },
        { id: 4, name: "Skill Building", icon: "🎓", color: "#8b5cf6" },
        { id: 5, name: "Success Stories", icon: "🏆", color: "#facc15" },
        { id: 6, name: "General Help", icon: "💬", color: "#64748b" }
    ])
    const [discussions, setDiscussions] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedTags, setSelectedTags] = useState([])
    const [filterType, setFilterType] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showNewDiscussion, setShowNewDiscussion] = useState(false)
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        content: '',
        category_id: '',
        tags: ''
    })

    const [selectedDiscussion, setSelectedDiscussion] = useState(null)
    const [replies, setReplies] = useState([])
    const [newReply, setNewReply] = useState('')
    const [isPostingReply, setIsPostingReply] = useState(false)
    const [contributors, setContributors] = useState([])
    const repliesEndRef = useRef(null)

    const [tagsOpen, setTagsOpen] = useState(false)
    const [tagList, setTagList] = useState(() => {
        const savedTags = localStorage.getItem('forum_tags');
        return savedTags ? JSON.parse(savedTags) : [
            { name: 'Community Support', color: '#6366f1' },
            { name: 'Social Impact', color: '#f59e0b' }
        ];
    })
    const [newTagName, setNewTagName] = useState('')
    const [isAddingTag, setIsAddingTag] = useState(false)

    useEffect(() => {
        localStorage.setItem('forum_tags', JSON.stringify(tagList));
    }, [tagList])
    const isAdmin = user?.email === 'riteshkumar90359@gmail.com'

    useEffect(() => {
        fetchData()

        // Polling for discussions list and stats (Automatic updates for 'Last Replied', counts, etc.)
        const discussionsInterval = setInterval(() => {
            fetchDiscussionsAndStats()
        }, 10000) // Every 10 seconds

        return () => clearInterval(discussionsInterval)
    }, [selectedCategory, filterType, selectedTags])

    // Polling for replies when a discussion is open (Live comments)
    useEffect(() => {
        let repliesInterval;
        if (selectedDiscussion) {
            repliesInterval = setInterval(async () => {
                try {
                    const repliesRes = await api.get(`/forum/discussions/${selectedDiscussion.id}/replies`)
                    // Only update if count changed or content different to avoid flickering
                    if (repliesRes.data.length !== replies.length) {
                        setReplies(repliesRes.data)
                    }
                } catch (err) {
                    console.error('Error polling replies:', err)
                }
            }, 5000) // Every 5 seconds for open conversations
        }
        return () => {
            if (repliesInterval) clearInterval(repliesInterval)
        }
    }, [selectedDiscussion, replies.length])

    const scrollToBottom = () => {
        setTimeout(() => {
            repliesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        }, 100)
    }

    useEffect(() => {
        if (selectedDiscussion) {
            scrollToBottom()
        }
    }, [replies.length])

    const fetchDiscussionsAndStats = async () => {
        try {
            // Build the URL for discussions
            let url = `/forum/discussions?filter_type=${filterType}`
            if (selectedCategory) url += `&category_id=${selectedCategory}`
            if (selectedTags.length > 0) url += `&tags=${encodeURIComponent(selectedTags.join(','))}`

            // Fetch discussions, stats, and contributors in parallel for speed
            const [discussionsRes, statsRes, contributorsRes] = await Promise.all([
                api.get(url),
                api.get('/forum/stats'),
                api.get('/forum/top-contributors')
            ]);

            setDiscussions(Array.isArray(discussionsRes.data) ? discussionsRes.data : [])
            setStats(statsRes.data)
            setContributors(contributorsRes.data || [])
        } catch (error) {
            console.error('Error fetching dynamic data:', error)
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            
            // 1. Fetch categories
            const categoriesRes = await api.get('/forum/categories')
            if (Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
                setCategories(categoriesRes.data)
            }
            
            // 2. Fetch the dynamic data in parallel
            await fetchDiscussionsAndStats()
            
        } catch (error) {
            console.error('Error fetching forum base data:', error)
            setDiscussions([])
        } finally {
            setLoading(false)
        }
    }

    const handleCreateDiscussion = async (e) => {
        e.preventDefault()
        try {
            const tags = newDiscussion.tags.split(',').map(t => t.trim()).filter(t => t)

            await api.post('/forum/discussions', {
                title: newDiscussion.title,
                content: newDiscussion.content,
                category_id: parseInt(newDiscussion.category_id),
                tags: tags
            })

            setShowNewDiscussion(false)
            setNewDiscussion({ title: '', content: '', category_id: '', tags: '' })
            fetchData()
            alert('Discussion posted successfully!')
        } catch (error) {
            console.error('Error creating discussion:', error)
            alert(error.response?.data?.detail || 'Failed to post discussion')
        }
    }

    const handleLike = async (discId, e) => {
        if (e) e.stopPropagation()
        try {
            const res = await api.post(`/forum/discussions/${discId}/like`)
            setDiscussions(discussions.map(d =>
                d.id === discId ? { ...d, likes: res.data.likes, is_liked: res.data.is_liked } : d
            ))
            if (selectedDiscussion?.id === discId) {
                setSelectedDiscussion({ ...selectedDiscussion, likes: res.data.likes, is_liked: res.data.is_liked })
            }
        } catch (error) {
            alert('Login to like discussions')
        }
    }

    const handleViewDiscussion = async (discId) => {
        try {
            const res = await api.get(`/forum/discussions/${discId}`)
            setSelectedDiscussion(res.data)
            const repliesRes = await api.get(`/forum/discussions/${discId}/replies`)
            setReplies(repliesRes.data)
            // Update the local list views count
            setDiscussions(discussions.map(d =>
                d.id === discId ? { ...d, views: res.data.views } : d
            ))
        } catch (error) {
            console.error('Error fetching discussion details:', error)
        }
    }

    const handlePostReply = async (e) => {
        e.preventDefault()
        if (!newReply.trim()) return
        setIsPostingReply(true)
        try {
            const res = await api.post(`/forum/discussions/${selectedDiscussion.id}/replies`, {
                content: newReply
            })
            setReplies([...replies, res.data])
            setNewReply('')
            // Update reply count in the list
            setDiscussions(discussions.map(d =>
                d.id === selectedDiscussion.id ? { ...d, reply_count: (d.reply_count || 0) + 1 } : d
            ))
            setSelectedDiscussion({
                ...selectedDiscussion,
                reply_count: (selectedDiscussion.reply_count || 0) + 1
            })
            // Force refresh discussions list to update "latest_reply" on the card
            fetchDiscussionsAndStats()
            // Scroll to the new comment
            scrollToBottom()
        } catch (error) {
            alert('Failed to post reply. Please login.')
        } finally {
            setIsPostingReply(false)
        }
    }

    const handlePinReply = async (replyId, e) => {
        if (e) e.stopPropagation()
        try {
            await api.post(`/forum/replies/${replyId}/pin`)
            // Refresh replies to show the change
            const repliesRes = await api.get(`/forum/discussions/${selectedDiscussion.id}/replies`)
            setReplies(repliesRes.data)
        } catch (error) {
            alert('Not authorized to pin this reply')
        }
    }



    const getCategoryById = (id) => {
        return categories.find(cat => cat.id === id)
    }

    const filteredDiscussions = discussions.filter(disc =>
        disc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disc.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="forum-container">
                <div className="loading-spinner">Loading forum...</div>
            </div>
        )
    }

    return (
        <div className="forum-container">
            {/* Hero Section */}
            <div className="forum-hero">
                <div className="forum-hero-content">
                    <h1>
                        <MessageSquare className="hero-icon" />
                        Community Forum
                    </h1>
                    <p>Connect, ask questions, and share knowledge to empower underserved communities.</p>
                    <button
                        className="btn-start-discussion"
                        onClick={() => setShowNewDiscussion(true)}
                    >
                        <Plus size={20} />
                        Start Discussion
                    </button>
                </div>
            </div>

            {/* Stats Bar - Admin sees all, users see limited */}
            {stats && (
                <div className="forum-stats">
                    <div className="stat-card">
                        <MessageCircle className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{stats.total_discussions}</span>
                            <span className="stat-label">Discussions</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <MessageSquare className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{stats.total_replies}</span>
                            <span className="stat-label">Replies</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="stat-card admin-only">
                            <Users className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{stats.total_users}</span>
                                <span className="stat-label">Total Users</span>
                            </div>
                        </div>
                    )}
                    <div className="stat-card">
                        <Eye className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{stats.total_views}</span>
                            <span className="stat-label">Views</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="stat-card admin-only">
                            <BarChart3 className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-value">{stats.active_discussions}</span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="forum-main">
                {/* Sidebar */}
                <aside className="forum-sidebar">
                    <div className="sidebar-section">
                        <h3>Categories</h3>
                        <div className="category-list">
                            <button
                                className={`category-item ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <span className="category-icon">📋</span>
                                <div className="category-info">
                                    <span className="category-name">All</span>
                                    <span className="category-count">
                                        {discussions.length}
                                    </span>
                                </div>
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                    style={{ '--category-color': category.color || '#3b82f6' }}
                                >
                                    <span className="category-icon">{category.icon || '💬'}</span>
                                    <div className="category-info">
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-count">
                                            {category.discussion_count}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <button
                            className="sidebar-toggle-btn"
                            onClick={() => setTagsOpen(!tagsOpen)}
                        >
                            <div className="flex items-center gap-12">
                                <h3>Popular Tags</h3>
                            </div>
                            <ChevronDown
                                size={18}
                                className={`toggle-icon ${tagsOpen ? 'rotated' : ''}`}
                            />
                        </button>

                        <div className={`tag-dropdown-content ${tagsOpen ? 'open' : ''}`}>
                            <div className="tag-cloud">
                                {tagList.map(tag => {
                                    const isActive = selectedTags.includes(tag.name);
                                    return (
                                        <div key={tag.name} className="tag-wrapper">
                                            <button
                                                className={`tag ${isActive ? 'active' : ''}`}
                                                style={{
                                                    '--tag-color': tag.color,
                                                    '--tag-glow': `${tag.color}44`
                                                }}
                                                onClick={() => {
                                                    setSelectedTags(prev =>
                                                        prev.includes(tag.name)
                                                            ? prev.filter(t => t !== tag.name)
                                                            : [...prev, tag.name]
                                                    );
                                                }}
                                            >
                                                {isActive && <Star size={12} className="tag-check" fill="currentColor" />}
                                                {tag.name}
                                            </button>
                                            <button
                                                className="tag-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTagList(tagList.filter(t => t.name !== tag.name));
                                                    setSelectedTags(selectedTags.filter(t => t !== tag.name));
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}

                                {isAddingTag ? (
                                    <div className="add-tag-form">
                                        <input
                                            type="text"
                                            placeholder="Tag name..."
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
                                                    setTagList([...tagList, { name: newTagName, color: randomColor }]);
                                                    setNewTagName('');
                                                    setIsAddingTag(false);
                                                }
                                            }}
                                        />
                                        <button onClick={() => setIsAddingTag(false)} className="btn-close-tag">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="tag btn-add-tag"
                                        onClick={() => setIsAddingTag(true)}
                                    >
                                        <Plus size={14} /> Add Tag
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="forum-content">
                    {/* Filters and Search */}
                    <div className="forum-controls">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterType('all')}
                            >
                                <Filter size={16} />
                                All
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'latest' ? 'active' : ''}`}
                                onClick={() => setFilterType('latest')}
                            >
                                <Clock size={16} />
                                Latest
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'popular' ? 'active' : ''}`}
                                onClick={() => setFilterType('popular')}
                            >
                                <TrendingUp size={16} />
                                Popular
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'unanswered' ? 'active' : ''}`}
                                onClick={() => setFilterType('unanswered')}
                            >
                                <MessageCircle size={16} />
                                Unanswered
                            </button>
                            <button
                                className={`filter-btn ${filterType === 'featured' ? 'active' : ''}`}
                                onClick={() => setFilterType('featured')}
                            >
                                <Star size={16} />
                                Featured
                            </button>
                        </div>
                    </div>

                    {/* Discussions List */}
                    <div className="discussions-list">
                        {filteredDiscussions.length === 0 ? (
                            <div className="no-discussions">
                                <MessageSquare size={48} />
                                <p>No discussions found. Start a new one!</p>
                            </div>
                        ) : (
                            filteredDiscussions.map(discussion => {
                                const category = getCategoryById(discussion.category_id)
                                return (
                                    <div
                                        key={discussion.id}
                                        className="discussion-card"
                                        onClick={() => handleViewDiscussion(discussion.id)}
                                    >
                                        {discussion.is_featured && (
                                            <div className="featured-badge">Featured</div>
                                        )}
                                        <div className="discussion-header">
                                            <div className="discussion-meta">
                                                {category && (
                                                    <span
                                                        className="discussion-category"
                                                        style={{ backgroundColor: category.color || '#3b82f6' }}
                                                    >
                                                        {category.icon} {category.name}
                                                    </span>
                                                )}
                                                <div className="discussion-tags">
                                                    {discussion.tags?.map((tag, idx) => (
                                                        <span key={idx} className="tag-small">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="discussion-author">
                                                <div className="author-avatar">
                                                    {discussion.user_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="author-info">
                                                    <span className="author-name">{discussion.user_name}</span>
                                                    <span className="discussion-time">
                                                        {new Date(discussion.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="discussion-title">{discussion.title}</h3>
                                        <p className="discussion-excerpt">
                                            {discussion.content.substring(0, 150)}...
                                        </p>

                                        {discussion.latest_reply && (
                                            <div className="latest-comment-preview">
                                                <div className="preview-header">
                                                    <MessageCircle size={12} />
                                                    Latest reply from <strong>{discussion.latest_reply.user_name}</strong>
                                                </div>
                                                <p className="preview-content">{discussion.latest_reply.content.substring(0, 60)}...</p>
                                            </div>
                                        )}

                                        <div className="discussion-footer">
                                            <div className="discussion-stats">
                                                <span className="stat-item">
                                                    <MessageCircle size={16} />
                                                    {discussion.reply_count}
                                                </span>
                                                <span className="stat-item">
                                                    <Eye size={16} />
                                                    {discussion.views}
                                                </span>
                                                <button
                                                    className={`stat-item btn-like ${discussion.is_liked ? 'liked' : ''}`}
                                                    onClick={(e) => handleLike(discussion.id, e)}
                                                >
                                                    <ThumbsUp size={16} fill={discussion.is_liked ? "currentColor" : "none"} />
                                                    {discussion.likes}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Top Contributors Sidebar */}
                <aside className="forum-sidebar-right">
                    <div className="sidebar-section">
                        <h3>Top Contributors</h3>
                        <div className="contributors-list">
                            {contributors.length > 0 ? (
                                contributors.map((contributor) => (
                                    <div key={contributor.user_id} className="contributor-item">
                                        <div className="contributor-avatar">
                                            {(contributor.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="contributor-info">
                                            <span className="contributor-name">{contributor.name}</span>
                                            <span className="contributor-points">⭐ {contributor.points}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted" style={{ fontSize: '0.85rem' }}>No top contributors yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Trending Topics</h3>
                        <div className="trending-list">
                            <div className="trending-item">
                                <TrendingUp size={16} className="trending-icon" />
                                <span>Scaling AI Solutions in Rural India</span>
                            </div>
                            <div className="trending-item">
                                <TrendingUp size={16} className="trending-icon" />
                                <span>Improving AI Chatbots for Local Languages</span>
                            </div>
                        </div>
                    </div>

                    <LiveChat />
                </aside>
            </div>

            {/* New Discussion Modal */}
            {showNewDiscussion && (
                <div className="modal-overlay" onClick={() => setShowNewDiscussion(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowNewDiscussion(false)}
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                        <h2>Start a New Discussion</h2>
                        <form onSubmit={handleCreateDiscussion}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={newDiscussion.title}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                    placeholder="What's your question or topic?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Category</label>
                                <select
                                    className="category-dropdown-select"
                                    value={newDiscussion.category_id}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Choose a category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={newDiscussion.content}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                    placeholder="Describe your question or topic in detail..."
                                    rows={6}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newDiscussion.tags}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                                    placeholder="AI, NLP, Data, etc."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    Post Discussion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Discussion Detail Modal */}
            {selectedDiscussion && (
                <div className="modal-overlay" onClick={() => setSelectedDiscussion(null)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close-btn"
                            onClick={() => setSelectedDiscussion(null)}
                        >
                            <X size={24} />
                        </button>

                        <div className="discussion-detail-header">
                            <span
                                className="discussion-category"
                                style={{ backgroundColor: getCategoryById(selectedDiscussion.category_id)?.color }}
                            >
                                {getCategoryById(selectedDiscussion.category_id)?.icon} {getCategoryById(selectedDiscussion.category_id)?.name}
                            </span>
                            <h1>{selectedDiscussion.title}</h1>
                            <div className="author-full-info">
                                <div className="author-details-wrapper">
                                    <div className="author-avatar-large">
                                        {selectedDiscussion.user_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="author-name-bold">{selectedDiscussion.user_name}</div>
                                        <div className="post-date">Posted on {new Date(selectedDiscussion.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button className="btn-contact-author">
                                    <MessageSquare size={16} />
                                    Message
                                </button>
                            </div>
                        </div>

                        <div className="discussion-detail-body">
                            <p className="full-content">{selectedDiscussion.content}</p>
                            <div className="detail-tags">
                                {selectedDiscussion.tags?.map((t, idx) => (
                                    <span key={idx} className="tag-badge">#{t}</span>
                                ))}
                            </div>
                            <div className="engagement-actions">
                                <button
                                    className={`action-btn ${selectedDiscussion.is_liked ? 'liked' : ''}`}
                                    onClick={() => handleLike(selectedDiscussion.id)}
                                >
                                    <ThumbsUp size={20} fill={selectedDiscussion.is_liked ? "currentColor" : "none"} /> {selectedDiscussion.likes} Likes
                                </button>
                                <span className="action-info">
                                    <Eye size={20} /> {selectedDiscussion.views} Views
                                </span>
                                <span className="action-info">
                                    <MessageCircle size={20} /> {selectedDiscussion.reply_count} Replies
                                </span>
                            </div>
                        </div>

                        <div className="discussion-replies-section">
                            <h3>Replies ({replies.length})</h3>

                            {/* Reply Form - Moved to Top */}
                            {user ? (
                                <div className="reply-input-area">
                                    <div className="current-user-avatar">
                                        {(user.name || user.email)?.charAt(0).toUpperCase()}
                                    </div>
                                    <form className="reply-form-modern" onSubmit={handlePostReply}>
                                        <textarea
                                            value={newReply}
                                            onChange={(e) => setNewReply(e.target.value)}
                                            placeholder="What are your thoughts?"
                                            rows={2}
                                            required
                                        />
                                        <div className="reply-form-actions">
                                            <button
                                                type="submit"
                                                className="btn-submit-reply"
                                                disabled={isPostingReply}
                                            >
                                                {isPostingReply ? <div className="spinner-small"></div> : 'Reply'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="login-prompt-compact">
                                    <Link to="/login" className="highlight">Log in</Link> to share your thoughts.
                                </div>
                            )}

                            <div className="replies-list-modern">
                                {[...replies].sort((a, b) => (b.is_solution ? 1 : 0) - (a.is_solution ? 1 : 0)).map(reply => (
                                    <div key={reply.id} className={`comment-item ${reply.is_solution ? 'is-pinned' : ''}`}>
                                        <div className="comment-avatar">
                                            {reply.user_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="comment-body">
                                            <div className="comment-header">
                                                <div className="comment-author-info">
                                                    <span className="comment-author">{reply.user_name}</span>
                                                    {reply.is_solution && (
                                                        <span className="pinned-badge">
                                                            <Pin size={12} /> Solution
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="comment-date">
                                                    {new Date(reply.created_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="comment-text">{reply.content}</div>
                                            <div className="comment-actions">
                                                <button
                                                    className={`comment-action-btn ${reply.is_liked ? 'liked' : ''}`}
                                                    onClick={(e) => {
                                                        if (e) e.stopPropagation()
                                                        api.post(`/forum/replies/${reply.id}/like`).then(res => {
                                                            setReplies(replies.map(r =>
                                                                r.id === reply.id ? { ...r, likes: res.data.likes, is_liked: res.data.is_liked } : r
                                                            ))
                                                        }).catch(() => alert('Login to like replies'))
                                                    }}
                                                >
                                                    <ThumbsUp size={14} fill={reply.is_liked ? "currentColor" : "none"} />
                                                    <span>{reply.likes || 0}</span>
                                                </button>
                                                <span className="comment-stat">
                                                    <Eye size={14} />
                                                    <span>{reply.views || 0}</span>
                                                </span>

                                                {/* Pin/Unpin button for author or admin */}
                                                {(isAdmin || selectedDiscussion.user_id === user?.id) && (
                                                    <button
                                                        className={`comment-action-btn pin-btn ${reply.is_solution ? 'active' : ''}`}
                                                        onClick={(e) => handlePinReply(reply.id, e)}
                                                        title={reply.is_solution ? "Unpin Solution" : "Mark as Solution"}
                                                    >
                                                        <Pin size={14} fill={reply.is_solution ? "currentColor" : "none"} />
                                                        <span>{reply.is_solution ? 'Pinned' : 'Pin'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {replies.length === 0 && <p className="no-replies-subtle">No thoughts yet. Be the first!</p>}
                                <div ref={repliesEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Forum
