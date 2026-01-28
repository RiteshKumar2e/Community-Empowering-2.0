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
    ChevronDown
} from 'lucide-react'
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
    }, [selectedCategory, filterType, selectedTags])

    const fetchData = async () => {
        try {
            // Fetch categories
            const categoriesRes = await api.get('/forum/categories')
            if (Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
                setCategories(categoriesRes.data)
            }

            // Fetch discussions
            let url = `/forum/discussions?filter_type=${filterType}`
            if (selectedCategory) {
                url += `&category_id=${selectedCategory}`
            }
            if (selectedTags.length > 0) {
                url += `&tags=${encodeURIComponent(selectedTags.join(','))}`
            }
            const discussionsRes = await api.get(url)
            setDiscussions(Array.isArray(discussionsRes.data) ? discussionsRes.data : [])

            // Fetch stats
            const statsRes = await api.get('/forum/stats')
            setStats(statsRes.data)

        } catch (error) {
            console.error('Error fetching forum data:', error)
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
                                    <div key={discussion.id} className="discussion-card">
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
                                        </div>
                                        <h3 className="discussion-title">{discussion.title}</h3>
                                        <p className="discussion-excerpt">
                                            {discussion.content.substring(0, 150)}...
                                        </p>
                                        <div className="discussion-footer">
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
                                            <div className="discussion-stats">
                                                <span className="stat-item">
                                                    <MessageCircle size={16} />
                                                    {discussion.reply_count}
                                                </span>
                                                <span className="stat-item">
                                                    <Eye size={16} />
                                                    {discussion.views}
                                                </span>
                                                <span className="stat-item">
                                                    <ThumbsUp size={16} />
                                                    {discussion.likes}
                                                </span>
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
                            <div className="contributor-item">
                                <div className="contributor-avatar">P</div>
                                <div className="contributor-info">
                                    <span className="contributor-name">Priya Sharma</span>
                                    <span className="contributor-points">⭐ 355</span>
                                </div>
                            </div>
                            <div className="contributor-item">
                                <div className="contributor-avatar">A</div>
                                <div className="contributor-info">
                                    <span className="contributor-name">Amit Patel</span>
                                    <span className="contributor-points">⭐ 290</span>
                                </div>
                            </div>
                            <div className="contributor-item">
                                <div className="contributor-avatar">R</div>
                                <div className="contributor-info">
                                    <span className="contributor-name">Ravi Kumar</span>
                                    <span className="contributor-points">⭐ 215</span>
                                </div>
                            </div>
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

        </div>
    )
}

export default Forum
