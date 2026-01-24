import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, MapPin, Globe, Edit2, Save, Camera, LogOut, Shield, Bell } from 'lucide-react'
import api from '../services/api'
import '../styles/Profile.css'

const Profile = () => {
    const { user, logout, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        language: user?.language || 'en',
        communityType: user?.communityType || 'general'
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await api.put('/users/me', formData)
            updateUser(response.data)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoClick = () => {
        fileInputRef.current.click()
    }

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const response = await api.post('/users/me/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            // Update the user state with new photo path
            const updatedUser = { ...user, profileImage: response.data.profileImage }
            updateUser(updatedUser)
        } catch (error) {
            console.error('Failed to upload photo:', error)
            alert('Failed to upload photo. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Helper to get correctly formatted image URL
    const getProfileImage = () => {
        if (user?.profileImage) {
            const baseUrl = api.defaults.baseURL.replace('/api', '')
            return `${baseUrl}${user.profileImage}`
        }
        return null
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar-container">
                            <div className="profile-avatar" onClick={handlePhotoClick}>
                                {getProfileImage() ? (
                                    <img src={getProfileImage()} alt={user?.name} className="avatar-img" />
                                ) : (
                                    <User size={48} />
                                )}
                                <div className="avatar-overlay">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>
                        <div className="profile-info">
                            <h1>{user?.name}</h1>
                            <p>{user?.email}</p>
                            <span className="badge badge-primary">{user?.communityType?.charAt(0).toUpperCase() + user?.communityType?.slice(1) || 'General'} User</span>
                        </div>
                        <button
                            className="btn btn-outline"
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            disabled={loading}
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Profile Details */}
                    <div className="profile-details">
                        <h2>Personal Information</h2>

                        <div className="details-grid">
                            <div className="detail-item">
                                <label>
                                    <User size={18} />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                ) : (
                                    <p>{user?.name}</p>
                                )}
                            </div>

                            <div className="detail-item">
                                <label>
                                    <Mail size={18} />
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                ) : (
                                    <p>{user?.email}</p>
                                )}
                            </div>

                            <div className="detail-item">
                                <label>
                                    <Phone size={18} />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                ) : (
                                    <p>{user?.phone}</p>
                                )}
                            </div>

                            <div className="detail-item">
                                <label>
                                    <MapPin size={18} />
                                    Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                ) : (
                                    <p>{user?.location || 'Not set'}</p>
                                )}
                            </div>

                            <div className="detail-item">
                                <label>
                                    <Globe size={18} />
                                    Preferred Language
                                </label>
                                {isEditing ? (
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">हिंदी (Hindi)</option>
                                        <option value="bn">বাংলা (Bengali)</option>
                                        <option value="te">తెలుగు (Telugu)</option>
                                        <option value="mr">मराठी (Marathi)</option>
                                    </select>
                                ) : (
                                    <p>{formData.language === 'en' ? 'English' :
                                        formData.language === 'hi' ? 'हिंदी (Hindi)' :
                                            formData.language === 'bn' ? 'বাংলা (Bengali)' :
                                                formData.language === 'te' ? 'తెలుగు (Telugu)' :
                                                    formData.language === 'mr' ? 'मराठी (Marathi)' : 'English'}</p>
                                )}
                            </div>

                            <div className="detail-item">
                                <label>
                                    <User size={18} />
                                    Community Type
                                </label>
                                {isEditing ? (
                                    <select
                                        name="communityType"
                                        value={formData.communityType}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="general">General</option>
                                        <option value="student">Student</option>
                                        <option value="farmer">Farmer</option>
                                        <option value="worker">Worker</option>
                                        <option value="business">Small Business</option>
                                        <option value="senior">Senior Citizen</option>
                                    </select>
                                ) : (
                                    <p>{user?.communityType?.charAt(0).toUpperCase() + user?.communityType?.slice(1) || 'General'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="account-actions">
                        <h2>Account Settings</h2>
                        <div className="actions-grid">
                            <button className="action-btn">
                                <Shield size={18} />
                                Privacy & Security
                            </button>
                            <button className="action-btn">
                                <Bell size={18} />
                                Notifications
                            </button>
                            <button className="action-btn danger" onClick={logout}>
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
