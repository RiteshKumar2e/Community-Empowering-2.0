import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
    Users, MessageSquare, BookOpen, Search, TrendingUp, Award,
    Shield, Activity, Database, Globe, AlertCircle, CheckCircle,
    UserCheck, FileText, BarChart3, Clock
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
            const [usersRes, queriesRes, enrollmentsRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/queries'),
                api.get('/admin/enrollments'),
                api.get('/admin/stats')
            ])

            setUsers(usersRes.data || [])
            setRecentQueries(queriesRes.data || [])
            setRecentEnrollments(enrollmentsRes.data || [])

            setStats({
                totalUsers: statsRes.data.totalUsers,
                totalQueries: statsRes.data.totalQueries,
                totalCourses: statsRes.data.totalEnrollments, // Just using total enrollments as placeholder
                totalResources: 0,
                activeUsers: statsRes.data.activeUsers,
                todayQueries: queriesRes.data?.filter(q => {
                    const today = new Date().toDateString()
                    return new Date(q.created_at).toDateString() === today
                })?.length || 0
            })
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
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
                        <p>Complete platform overview and management</p>
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
                        </div>

                        <div className="admin-content-grid">
                            {/* Recent Queries */}
                            <div className="admin-section">
                                <div className="section-header">
                                    <h2>Recent AI Queries</h2>
                                </div>
                                <div className="queries-list">
                                    {recentQueries.slice(0, 5).map((query, index) => (
                                        <div key={index} className="query-item">
                                            <p><strong>Q:</strong> {query.message}</p>
                                            <p><strong>A:</strong> {query.response?.substring(0, 100)}...</p>
                                        </div>
                                    ))}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.community_type}</td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
