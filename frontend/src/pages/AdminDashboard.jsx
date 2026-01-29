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
    const [detailedActivities, setDetailedActivities] = useState([])
    const [selectedActivities, setSelectedActivities] = useState([])
    const [selectedQueries, setSelectedQueries] = useState([])

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
            const [usersRes, queriesRes, statsRes, feedbackRes, resRes, platformsRes, discussionsRes, activitiesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/queries'),
                api.get('/admin/stats'),
                api.get('/admin/feedback'),
                api.get('/admin/resources'),
                api.get('/admin/learning-platforms'),
                api.get('/admin/forum/discussions'),
                api.get('/admin/activities')
            ])

            setDiscussions(discussionsRes.data || [])
            setUsers(usersRes.data || [])
            setRecentQueries(queriesRes.data || [])
            setFeedback(feedbackRes.data || [])
            setExistingResources(resRes.data || [])
            setExistingPlatforms(platformsRes.data || [])
            setDetailedActivities(activitiesRes.data || [])

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
                ...(feedbackRes.data || []).map(f => ({ type: 'feedback', name: f.user_name || 'User', time: f.created_at })),
                ...(activitiesRes.data || []).map(a => ({
                    id: a.id,
                    type: a.type === 'ai_query' ? 'ai_query' : a.type,
                    name: a.user_name,
                    time: a.created_at,
                    title: a.title
                }))
            ].sort((a, b) => new Date(b.time || b.created_at) - new Date(a.time || a.created_at)).slice(0, 10)

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

    const handleDeleteActivity = async (id) => {
        if (!window.confirm('Delete this activity log?')) return
        try {
            await api.delete(`/admin/activities/${id}`)
            setDetailedActivities(detailedActivities.filter(a => a.id !== id))
            setRecentActivity(recentActivity.filter(a => a.id !== id))
        } catch (error) { alert('Delete failed') }
    }

    const handleClearAllActivities = async () => {
        if (!window.confirm('Are you SURE you want to clear ALL activity logs? This cannot be undone.')) return
        try {
            await api.delete('/admin/activities/clear-all/logs')
            setDetailedActivities([])
            setRecentActivity(recentActivity.filter(a => !a.id)) // Keep system join/feedback items if they don't have DB IDs, but clear tracked ones
            setSelectedActivities([])
            alert('All activity logs cleared')
        } catch (error) { alert('Clear failed') }
    }

    const handleToggleSelect = (id) => {
        setSelectedActivities(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedActivities(detailedActivities.map(a => a.id).filter(id => id))
        } else {
            setSelectedActivities([])
        }
    }

    const handleDeleteSelectedActivities = async () => {
        if (selectedActivities.length === 0) return
        if (!window.confirm(`Delete ${selectedActivities.length} selected activities?`)) return

        try {
            await api.post('/admin/activities/bulk-delete', { ids: selectedActivities })
            setDetailedActivities(prev => prev.filter(a => !selectedActivities.includes(a.id)))
            setRecentActivity(prev => prev.filter(a => !selectedActivities.includes(a.id)))
            setSelectedActivities([])
            alert('Selected activities deleted')
        } catch (error) {
            alert('Bulk delete failed')
        }
    }

    const handleDeleteQuery = async (id) => {
        if (!window.confirm('Delete this query?')) return
        try {
            await api.delete(`/admin/queries/${id}`)
            setRecentQueries(recentQueries.filter(q => q.id !== id))
            setSelectedQueries(selectedQueries.filter(qId => qId !== id))
        } catch (error) { alert('Delete failed') }
    }

    const handleClearAllQueries = async () => {
        if (!window.confirm('Clear ALL AI queries?')) return
        try {
            await api.delete('/admin/queries/clear-all/all')
            setRecentQueries([])
            setSelectedQueries([])
            alert('All queries cleared')
        } catch (error) { alert('Clear failed') }
    }

    const handleToggleSelectQuery = (id) => {
        setSelectedQueries(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleSelectAllQueries = (e) => {
        if (e.target.checked) {
            setSelectedQueries(recentQueries.map(q => q.id))
        } else {
            setSelectedQueries([])
        }
    }

    const handleDeleteSelectedQueries = async () => {
        if (selectedQueries.length === 0) return
        if (!window.confirm(`Delete ${selectedQueries.length} selected queries?`)) return
        try {
            await api.post('/admin/queries/bulk-delete', { ids: selectedQueries })
            setRecentQueries(prev => prev.filter(q => !selectedQueries.includes(q.id)))
            setSelectedQueries([])
            alert('Selected queries deleted')
        } catch (error) { alert('Bulk delete failed') }
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
                    <button
                        className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity Feed
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
                                    <button className="btn-delete-small secondary" onClick={handleClearAllActivities}>
                                        <Trash2 size={16} /> Clear All
                                    </button>
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
                                                    <strong>{act.user_name || act.name || 'Anonymous'}</strong>
                                                    {act.type === 'user' ? ' joined the community' :
                                                        act.type === 'feedback' ? ' shared their feedback' :
                                                            act.type === 'ai_query' ? ' consulted the AI Assistant' :
                                                                act.type === 'resource_view' ? ' viewed a resource' :
                                                                    act.type === 'course_enroll' ? ' enrolled in a course' :
                                                                        ` performed ${act.type}`}
                                                </p>
                                                <span>{act.created_at || new Date(act.time).toLocaleString()}</span>
                                            </div>
                                            {act.id && (
                                                <button
                                                    onClick={() => handleDeleteActivity(act.id)}
                                                    className="btn-delete-small transparent"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && <p className="text-muted">No recent activity detected.</p>}
                                </div>
                            </div>

                            {/* Recent Queries */}
                            <div className="admin-section">
                                <div className="section-header">
                                    <h2><MessageSquare size={20} /> Recent AI Queries</h2>
                                    <div className="section-actions">
                                        {selectedQueries.length > 0 && (
                                            <button className="btn-delete-small danger" onClick={handleDeleteSelectedQueries}>
                                                <Trash2 size={16} /> Delete Selected ({selectedQueries.length})
                                            </button>
                                        )}
                                        <button className="btn-delete-small secondary" onClick={handleClearAllQueries}>
                                            <Trash2 size={16} /> Clear All
                                        </button>
                                    </div>
                                </div>
                                <div className="queries-list">
                                    {recentQueries.slice(0, 6).map((query, index) => (
                                        <div key={index} className={`query-card-compact ${selectedQueries.includes(query.id) ? 'selected-row' : ''}`}>
                                            <div className="query-meta-top">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQueries.includes(query.id)}
                                                        onChange={() => handleToggleSelectQuery(query.id)}
                                                    />
                                                    <span className="query-lang">{query.language?.toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="query-date">{query.created_at || new Date(query.created_at).toLocaleTimeString()}</span>
                                                    <button
                                                        onClick={() => handleDeleteQuery(query.id)}
                                                        className="btn-delete-small transparent"
                                                        title="Delete Query"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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

                {activeTab === 'activity' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2><Activity size={20} /> Detailed User Activity Log</h2>
                            <div className="section-actions">
                                {selectedActivities.length > 0 && (
                                    <button className="btn-delete-small danger" onClick={handleDeleteSelectedActivities}>
                                        <Trash2 size={16} /> Delete Selected ({selectedActivities.length})
                                    </button>
                                )}
                                <button className="btn-delete-small secondary" onClick={handleClearAllActivities}>
                                    <Trash2 size={16} /> Clear All Logs
                                </button>
                            </div>
                        </div>
                        <p className="text-muted mb-3">Tracking searches, course enrollments, resource views, and platform visits.</p>
                        <div className="users-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedActivities.length > 0 && selectedActivities.length === detailedActivities.filter(a => a.id).length}
                                            />
                                        </th>
                                        <th>User</th>
                                        <th>Action Type</th>
                                        <th>Details</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedActivities.map((act, idx) => (
                                        <tr key={idx} className={selectedActivities.includes(act.id) ? 'selected-row' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedActivities.includes(act.id)}
                                                    onChange={() => handleToggleSelect(act.id)}
                                                    disabled={!act.id}
                                                />
                                            </td>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-icon small">
                                                        {(act.user_name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{act.user_name || 'Anonymous'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${act.type === 'search_query' ? 'info' :
                                                    act.type === 'resource_view' ? 'success' :
                                                        act.type === 'platform_visit' ? 'warning' :
                                                            act.type === 'forum_post' ? 'primary' : 'secondary'
                                                    }`}>
                                                    {(act.type || 'ACTIVITY').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="activity-detail-cell">
                                                    <strong>{act.title}</strong>
                                                    <p>{act.description}</p>
                                                </div>
                                            </td>
                                            <td>{act.created_at}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteActivity(act.id)}
                                                    className="btn-delete-small"
                                                    title="Delete Log"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {detailedActivities.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center">No detailed activities recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
                }

                {
                    activeTab === 'manage' && (
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
                    )
                }

                {
                    activeTab === 'users' && (
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
                    )
                }

                {
                    activeTab === 'feedback' && (
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
                    )
                }

                {
                    activeTab === 'forum' && (
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
                    )
                }
            </div >
        </div >
    )
}

export default AdminDashboard
