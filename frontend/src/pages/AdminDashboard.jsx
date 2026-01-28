import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
    Users, MessageSquare, BookOpen, Search, TrendingUp, Award,
    Shield, Activity, Database, Globe, AlertCircle, CheckCircle,
    UserCheck, FileText, BarChart3, Clock, Trash2, Heart, ExternalLink, Radar
} from 'lucide-react'
import api from '../services/api'
import '../styles/AdminDashboard.css'

const AdminDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalQueries: 0,
        totalCourses: 0,
        totalResources: 0,
        activeUsers: 0,
        todayQueries: 0
    })
    const [users, setUsers] = useState([])
    const [recentQueries, setRecentQueries] = useState([])
    const [recentEnrollments, setRecentEnrollments] = useState([])
    const [discussions, setDiscussions] = useState([])
    const [activeTab, setActiveTab] = useState('overview')
    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        category: 'education',
        eligibility: '',
        provider: '',
        link: '',
        isNew: true
    })
    const [newPlatform, setNewPlatform] = useState({
        title: '',
        description: '',
        category: 'digital',
        provider: '',
        duration: '',
        students: '',
        level: 'Beginner',
        link: '',
        features: '',
        isOfficial: false
    })
    const [feedback, setFeedback] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [existingResources, setExistingResources] = useState([])
    const [existingPlatforms, setExistingPlatforms] = useState([])
    const [isScanning, setIsScanning] = useState(false)
    const [forumCategories, setForumCategories] = useState([])
    const [newForumCategory, setNewForumCategory] = useState({
        name: '',
        description: '',
        icon: '💬',
        color: '#6366f1'
    })

    useEffect(() => {
        // Check if user is admin - more robust check
        if (!user?.is_admin && user?.email !== 'riteshkumar90359@gmail.com') {
            navigate('/dashboard')
            return
        }

        fetchAdminData()
    }, [user, navigate])

    const fetchAdminData = async () => {
        try {
            setLoading(true)
            const [usersRes, queriesRes, statsRes, feedbackRes, resRes, platformsRes, discussionsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/queries'),
                api.get('/admin/stats'),
                api.get('/admin/feedback'),
                api.get('/admin/resources'),
                api.get('/admin/learning-platforms'),
                api.get('/admin/forum/discussions')
            ])

            setDiscussions(discussionsRes.data || [])
            setUsers(usersRes.data || [])
            setRecentQueries(queriesRes.data || [])
            setFeedback(feedbackRes.data || [])
            setExistingResources(resRes.data || [])
            setExistingPlatforms(platformsRes.data || [])

            setStats({
                totalUsers: statsRes.data.totalUsers,
                totalQueries: statsRes.data.totalQueries,
                totalCourses: statsRes.data.totalEnrollments,
                totalResources: resRes.data?.length || 0,
                activeUsers: statsRes.data.activeUsers,
                todayQueries: queriesRes.data?.filter(q => {
                    const today = new Date().toDateString()
                    return new Date(q.created_at).toDateString() === today
                })?.length || 0
            })

            const activity = [
                ...(usersRes.data || []).map(u => ({ type: 'user', name: u.name, time: u.created_at })),
                ...(queriesRes.data || []).map(q => ({ type: 'query', name: 'Anonymous', time: q.created_at })),
                ...(feedbackRes.data || []).map(f => ({ type: 'feedback', name: f.user_name || 'User', time: f.created_at }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)

            setRecentActivity(activity)

            // Fetch forum categories
            try {
                const catRes = await api.get('/forum/categories')
                setForumCategories(catRes.data || [])
            } catch (err) { console.error('Error fetching forum categories:', err) }

        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateForumCategory = async (e) => {
        e.preventDefault()
        try {
            const res = await api.post('/forum/categories', newForumCategory)
            setForumCategories([...forumCategories, res.data])
            setNewForumCategory({ name: '', description: '', icon: '💬', color: '#6366f1' })
            alert('Category created successfully!')
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to create category')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return
        try {
            await api.delete(`/admin/users/${userId}`)
            setUsers(users.filter(u => u.id !== userId))
            alert('User deleted successfully')
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete user')
        }
    }

    const handleDeleteResource = async (id) => {
        if (!window.confirm('Delete this resource?')) return
        try {
            await api.delete(`/admin/resources/${id}`)
            setExistingResources(existingResources.filter(r => r.id !== id))
        } catch (error) { alert('Delete failed') }
    }

    const handleDeletePlatform = async (id) => {
        if (!window.confirm('Delete this platform?')) return
        try {
            await api.delete(`/admin/platforms/${id}`)
            setExistingPlatforms(existingPlatforms.filter(p => p.id !== id))
        } catch (error) { alert('Delete failed') }
    }

    const handleDeleteDiscussion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this discussion?')) return
        try {
            await api.delete(`/admin/forum/discussions/${id}`)
            setDiscussions(discussions.filter(d => d.id !== id))
            alert('Discussion deleted successfully')
        } catch (error) {
            alert('Delete failed')
        }
    }

    const handleToggleFeature = async (id) => {
        try {
            const res = await api.post(`/admin/forum/discussions/${id}/feature`)
            setDiscussions(discussions.map(d =>
                d.id === id ? { ...d, is_featured: res.data.is_featured } : d
            ))
        } catch (error) {
            alert('Feature toggle failed')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleMarketScan = async () => {
        try {
            setIsScanning(true)
            const res = await api.post('/admin/scan-market')
            alert(res.data.message)
            fetchAdminData() // refresh
        } catch (error) {
            alert('Scan failed')
        } finally {
            setIsScanning(false)
        }
    }

    const handleResourceSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/admin/resources', newResource)
            alert('Resource added successfully!')
            setNewResource({
                title: '',
                description: '',
                category: 'education',
                eligibility: '',
                provider: '',
                link: '',
                isNew: true
            })
        } catch (error) {
            alert('Failed to add resource')
        }
    }

    const handlePlatformSubmit = async (e) => {
        e.preventDefault()
        try {
            const platformData = {
                ...newPlatform,
                features: newPlatform.features.split(',').map(f => f.trim())
            }
            await api.post('/admin/platforms', platformData)
            alert('Platform added successfully!')
            setNewPlatform({
                title: '',
                description: '',
                category: 'digital',
                provider: '',
                duration: '',
                students: '',
                level: 'Beginner',
                link: '',
                features: '',
                isOfficial: false
            })
        } catch (error) {
            alert('Failed to add platform')
        }
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-large"></div>
                <p>Loading admin dashboard...</p>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1>
                            <Shield size={32} />
                            Admin Dashboard
                        </h1>
                        <p>Manage your community platform and resources</p>
                    </div>
                    <div className="admin-header-actions">
                        <button
                            className={`btn-scan ${isScanning ? 'scanning' : ''}`}
                            onClick={handleMarketScan}
                            disabled={isScanning}
                        >
                            <Radar size={18} className={isScanning ? 'spin' : ''} />
                            {isScanning ? 'Scanning Market...' : 'Scan Market Pulse'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage Content
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'feedback' ? 'active' : ''}`}
                        onClick={() => setActiveTab('feedback')}
                    >
                        Feedback
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'forum' ? 'active' : ''}`}
                        onClick={() => setActiveTab('forum')}
                    >
                        Forum
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card primary">
                                <div className="stat-icon"><Users size={32} /></div>
                                <div className="stat-details">
                                    <div className="stat-value">{stats.totalUsers}</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                            </div>
                            <div className="admin-stat-card success">
                                <div className="stat-icon"><MessageSquare size={32} /></div>
                                <div className="stat-details">
                                    <div className="stat-value">{stats.totalQueries}</div>
                                    <div className="stat-label">AI Queries</div>
                                </div>
                            </div>
                            <div className="admin-stat-card warning">
                                <div className="stat-icon"><Heart size={32} /></div>
                                <div className="stat-details">
                                    <div className="stat-value">{feedback.length}</div>
                                    <div className="stat-label">Feedbacks</div>
                                </div>
                            </div>
                            <div className="admin-stat-card info">
                                <div className="stat-icon"><MessageSquare size={32} /></div>
                                <div className="stat-details">
                                    <div className="stat-value">{discussions.length}</div>
                                    <div className="stat-label">Discussions</div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-content-grid">
                            {/* Analytics & Activity */}
                            <div className="admin-section">
                                <div className="section-header">
                                    <h2><Activity size={20} /> Latest Activity</h2>
                                </div>
                                <div className="activity-feed">
                                    {recentActivity.map((act, idx) => (
                                        <div key={idx} className="activity-item">
                                            <div className={`activity-icon ${act.type}`}>
                                                {act.type === 'user' ? <UserCheck size={16} /> :
                                                    act.type === 'feedback' ? <Heart size={16} /> :
                                                        <MessageSquare size={16} />}
                                            </div>
                                            <div className="activity-info">
                                                <p>
                                                    <strong>{act.name}</strong>
                                                    {act.type === 'user' ? ' joined the community' :
                                                        act.type === 'feedback' ? ' shared their feedback' :
                                                            ' consulted the AI Assistant'}
                                                </p>
                                                <span>{new Date(act.time).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && <p className="text-muted">No recent activity detected.</p>}
                                </div>
                            </div>

                            {/* Recent Queries */}
                            <div className="admin-section">
                                <div className="section-header">
                                    <h2><MessageSquare size={20} /> Recent AI Queries</h2>
                                </div>
                                <div className="queries-list">
                                    {recentQueries.slice(0, 4).map((query, index) => (
                                        <div key={index} className="query-card-compact">
                                            <div className="query-meta-top">
                                                <span className="query-lang">{query.language?.toUpperCase()}</span>
                                                <span className="query-date">{new Date(query.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="query-text">"{query.message}"</p>
                                        </div>
                                    ))}
                                    {recentQueries.length === 0 && <p className="text-muted">No queries yet.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'manage' && (
                    <div className="admin-management-grid">
                        {/* Add Resource Form */}
                        <div className="admin-section card-glass">
                            <div className="section-header">
                                <h2>Add New Government Resource</h2>
                            </div>
                            <form onSubmit={handleResourceSubmit} className="admin-form">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newResource.description}
                                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                    required
                                ></textarea>
                                <select
                                    value={newResource.category}
                                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                                >
                                    <option value="education">Education</option>
                                    <option value="health">Health</option>
                                    <option value="finance">Finance</option>
                                    <option value="agriculture">Agriculture</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Eligibility"
                                    value={newResource.eligibility}
                                    onChange={(e) => setNewResource({ ...newResource, eligibility: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Provider"
                                    value={newResource.provider}
                                    onChange={(e) => setNewResource({ ...newResource, provider: e.target.value })}
                                />
                                <input
                                    type="url"
                                    placeholder="Official Link"
                                    value={newResource.link}
                                    onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                                    required
                                />
                                <button type="submit" className="btn btn-primary">Add Resource</button>
                            </form>
                        </div>

                        {/* Add Platform Form */}
                        <div className="admin-section card-glass">
                            <div className="section-header">
                                <h2>Add Learning Platform</h2>
                            </div>
                            <form onSubmit={handlePlatformSubmit} className="admin-form">
                                <input
                                    type="text"
                                    placeholder="Platform Name"
                                    value={newPlatform.title}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newPlatform.description}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, description: e.target.value })}
                                    required
                                ></textarea>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Duration"
                                        value={newPlatform.duration}
                                        onChange={(e) => setNewPlatform({ ...newPlatform, duration: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Level (e.g. Beginner)"
                                        value={newPlatform.level}
                                        onChange={(e) => setNewPlatform({ ...newPlatform, level: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Features (comma separated)"
                                    value={newPlatform.features}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, features: e.target.value })}
                                />
                                <input
                                    type="url"
                                    placeholder="Registration Link"
                                    value={newPlatform.link}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, link: e.target.value })}
                                    required
                                />
                                <button type="submit" className="btn btn-success">Add Platform</button>
                            </form>
                        </div>

                        {/* Resource Management List */}
                        <div className="admin-section full-width">
                            <div className="section-header">
                                <h2>Manage Resources</h2>
                            </div>
                            <div className="content-manage-list">
                                {existingResources.map(res => (
                                    <div key={res.id} className="manage-item">
                                        <div className="item-info">
                                            <h4>{res.title}</h4>
                                            <p>{res.provider} • {res.category}</p>
                                        </div>
                                        <div className="item-actions">
                                            <a href={res.link} target="_blank" rel="noreferrer" className="action-btn"><ExternalLink size={18} /></a>
                                            <button onClick={() => handleDeleteResource(res.id)} className="action-btn delete"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Management List */}
                        <div className="admin-section full-width">
                            <div className="section-header">
                                <h2>Manage Platforms</h2>
                            </div>
                            <div className="content-manage-list">
                                {existingPlatforms.map(plat => (
                                    <div key={plat.id} className="manage-item">
                                        <div className="item-info">
                                            <h4>{plat.title}</h4>
                                            <p>{plat.provider} • {plat.level}</p>
                                        </div>
                                        <div className="item-actions">
                                            <a href={plat.link} target="_blank" rel="noreferrer" className="action-btn"><ExternalLink size={18} /></a>
                                            <button onClick={() => handleDeletePlatform(plat.id)} className="action-btn delete"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>User Management</h2>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Type</th>
                                        <th>Joined</th>
                                        <th>Last Login</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td> {u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.community_type}</td>
                                            <td>{formatDate(u.created_at)}</td>
                                            <td>{formatDate(u.last_login)}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="btn-delete-small"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>User Feedback ({feedback.length})</h2>
                        </div>
                        <div className="feedback-grid-admin">
                            {feedback.map((f, i) => (
                                <div key={i} className="admin-feedback-card">
                                    <div className="feedback-card-header">
                                        <div className="user-initial">{f.user_name?.charAt(0)}</div>
                                        <div className="user-meta">
                                            <h4>{f.user_name}</h4>
                                            <span>{f.user_email}</span>
                                        </div>
                                        <div className="feedback-rating">
                                            {'⭐'.repeat(f.rating)}
                                        </div>
                                    </div>
                                    <div className="feedback-category-tag">{f.category}</div>
                                    <p className="feedback-message">"{f.message}"</p>
                                    <div className="feedback-footer">
                                        {new Date(f.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {feedback.length === 0 && <p className="empty-msg">No feedback received yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'forum' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Forum Management</h2>
                        </div>

                        {/* Summary Stats */}
                        <div className="forum-admin-intro">
                            <div className="intro-card">
                                <h3>{discussions.length}</h3>
                                <span>Total Discussions</span>
                            </div>
                            <div className="intro-card">
                                <h3>{forumCategories.length}</h3>
                                <span>Categories</span>
                            </div>
                        </div>

                        {/* Category Creation Form */}
                        <div className="admin-subsection">
                            <h3>Add New Forum Category</h3>
                            <form onSubmit={handleCreateForumCategory} className="admin-form forum-cat-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Category Name (e.g. Community Support)"
                                        value={newForumCategory.name}
                                        onChange={e => setNewForumCategory({ ...newForumCategory, name: e.target.value })}
                                        required
                                    />
                                    <div className="form-row-mini">
                                        <input
                                            type="text"
                                            placeholder="Emoji (Icon)"
                                            value={newForumCategory.icon}
                                            onChange={e => setNewForumCategory({ ...newForumCategory, icon: e.target.value })}
                                            className="icon-input"
                                        />
                                        <input
                                            type="color"
                                            value={newForumCategory.color}
                                            onChange={e => setNewForumCategory({ ...newForumCategory, color: e.target.value })}
                                            title="Choose category color"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Brief description..."
                                    value={newForumCategory.description}
                                    onChange={e => setNewForumCategory({ ...newForumCategory, description: e.target.value })}
                                />
                                <button type="submit" className="btn-scan">Create Category</button>
                            </form>
                        </div>

                        <div className="admin-subsection">
                            <h3>Recent Discussions</h3>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Category</th>
                                            <th>Engagement</th>
                                            <th>Posted</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {discussions.map(d => (
                                            <tr key={d.id}>
                                                <td className="title-cell">
                                                    <div className="topic-title">{d.title}</div>
                                                    <small className="topic-meta">{d.reply_count} replies • {d.views} views</small>
                                                </td>
                                                <td>
                                                    <div className="author-info">
                                                        <div>{d.user_name}</div>
                                                        <small className="text-muted">{d.user_email}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge-category" style={{ backgroundColor: `${d.category_color}22`, color: d.category_color }}>
                                                        {d.category_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    {d.is_featured ? (
                                                        <span className="status-badge featured">Featured</span>
                                                    ) : (
                                                        <span className="status-badge text-muted">Standard</span>
                                                    )}
                                                </td>
                                                <td>{d.created_at}</td>
                                                <td>
                                                    <div className="action-row">
                                                        <button
                                                            onClick={() => handleToggleFeature(d.id)}
                                                            className={`action-btn-mini ${d.is_featured ? 'active' : ''}`}
                                                            title={d.is_featured ? "Unfeature" : "Feature"}
                                                        >
                                                            <Award size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDiscussion(d.id)}
                                                            className="action-btn-mini delete"
                                                            title="Delete Thread"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {discussions.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">No forum discussions yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
