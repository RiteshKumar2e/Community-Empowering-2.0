<div align="center">

# 🚀 Community AI Platform

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Groq-FF6B6B?style=for-the-badge&logo=ai&logoColor=white" alt="Groq AI"/>
</p>

<p align="center">
  <a href="https://communityai.co.in/"><img src="https://img.shields.io/badge/🌐_Live-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/📄_License-MIT-yellow?style=for-the-badge" alt="License"/></a>
</p>

**Enterprise-grade platform powering AI-driven community empowerment across India**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Deployment](#-deployment)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [🆕 Recent Updates](#-recent-updates)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Authentication & Security](#-authentication--security)
- [AI Integration](#-ai-integration)
- [Deployment](#-deployment)
- [Performance & Optimization](#-performance--optimization)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Community AI Platform** is a high-performance, production-ready application designed to democratize access to government services, educational resources, and employment opportunities for underserved communities across India. Built with modern technologies and best practices, this platform serves as an intelligent, multilingual solution that bridges the digital divide.

### 🌟 Mission Statement

> *"Empowering communities through intelligent technology — making public services, education, and opportunities accessible to everyone, everywhere."*

### 📊 Impact Metrics

<div align="center">

| Metric | Value |
|--------|-------|
| 📖 Detailed scheme guides | 12 (public, with official links) |
| 🏛️ Government resources listed | 200+ |
| 📚 Free learning platforms listed | 300+ |
| 🌐 AI chat languages | 11 |

</div>

---

## 🆕 Recent Updates

- **Database:** moved to Turso, with one connection per request and automatic replacement of idle connections
- **Reliability:** Turso driver panics now return a normal JSON 500 with CORS headers, so the browser shows the real error instead of "blocked by CORS"
- **Faster signup and OTP:** one-time codes use a keyed HMAC instead of bcrypt, signup saves in a single transaction, and bcrypt runs off the event loop
- **Faster forum and admin:** batched queries, pages that show at once with placeholders, and one `/api/admin/overview` request for the admin dashboard
- **Sign-in:** Google's script loads only on the login page with FedCM enabled, and the OTP window stays open on an outside click and shows "Verifying..."
- **Design:** navy and orange palette, IBM Plex Sans (with Devanagari for Hindi), no gradients, line icons and no hover effects on buttons
- **Dark theme:** theme-aware text colours (`--text-accent`, `--text-danger`, `--text-warning`, `--text-success`, `--text-info`)
- **Brand:** new SVG logo and favicon, with PNG and ICO fallbacks
- **Languages:** the preferred language chosen at signup or in Profile is applied to the site
- **Deploys:** tabs opened before a deploy reload themselves when a page file has been renamed
- **Emails:** formal OTP email in English and Hindi, stating that Community AI is not a government website

---

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**

- **Multi-Model AI Integration** - Groq models with Google Gemini as a fallback (models configurable via `GROQ_MODELS` / `GEMINI_MODELS`)
- **Amazon Q Business Intelligence** - Source-attributed Q&A, personalized learning paths, and automated business insights
- **Platform-Aware Assistant** - Chatbot is fully trained on platform identity, features, and mission
- **Multilingual NLP** - English, Hindi, Bengali, Telugu, Marathi support
- **Context-Aware Responses** - Personalized based on user profile and location
- **Smart Recommendations** - ML-driven content suggestions
- **UX: Auto-Focus Input** - Chatbot input automatically focuses on hover for instant interaction

### 📚 **Public Scheme Guides**

- **Scheme Pages** - Plain-language guides to 12 central and Jharkhand schemes: who can apply, benefits, documents and official links
- **Category Hubs** - Students, farmers, women, senior citizens, business, health and employment
- **Eligibility Checker** - 8 questions, no sign-up needed, with matching schemes as the result
- **Sign Up to Save and Apply** - Reading is open to everyone; saving progress needs a free account, and anything done before signing up is kept
- **Editorial Policy** - Every page shows when it was last updated, and that Community AI is not a government website

### 👤 **User Account**

- **My Schemes** - Saved schemes, saved eligibility results and reminders on the dashboard
- **Sign-In Options** - Email and password, or Google with an emailed OTP
- **Email Verification and Password Reset** - 6-digit codes that expire and allow limited attempts
- **Your Data** - Export your data or delete your account from the app

### 💬 **Community**

- **Forum** - Discussions, categories, tags, replies and likes
- **Live Chat** - Real-time community chat over WebSocket
- **AI Assistant** - Full assistant page and a floating chatbot on every page

### 🎨 **Design & Accessibility**

- **Design System** - Navy and orange palette, IBM Plex Sans, flat surfaces and line icons
- **Light and Dark Themes** - Saved per browser; text colours meet WCAG AA contrast in both
- **Language Toggle** - English and Hindi site text, with the AI assistant available in more languages
- **Text Size Control** - A- / A / A+ for easier reading
- **Sign-Up Wizard** - Three short steps, with the answers shaping what the user sees first
- **Mobile-First Design** - Responsive layouts across all devices

### 🔎 **SEO & Analytics**

- **Prerendered Pages** - Public pages are built as real HTML, so search engines and AI search crawlers can read them
- **Search Basics** - Per-page titles and descriptions, canonical URLs, JSON-LD, `sitemap.xml`, `robots.txt` and `llms.txt`
- **Private Pages Stay Private** - Signed-in pages are `noindex` and left out of the sitemap
- **Google Analytics 4** - Consent Mode: analytics stays off until the visitor accepts cookies, and only the live site reports
- **Growth Panel** - Signups and engagement for admins, from the app's own database

### 🔐 **Enterprise Security**

- **JWT Authentication** - Secure token-based auth
- **Bcrypt Password Hashing** - Industry-standard encryption
- **Password Visibility Toggle** - Secure show/hide option on login and registration for better UX
- **CORS Protection** - Configurable origin whitelisting
- **SQL Injection Prevention** - ORM-based parameterized queries
- **Input Validation** - Pydantic V2 models with strict type checking (ConfigDict)
- **Rate Limiting** - Limits on login, signup, password reset, OTP and AI requests
- **One-Time Codes** - Stored only as keyed hashes, with expiry and attempt limits
- **Upload Checks** - Profile photos are verified by file content and size
- **Security Headers** - HSTS, frame protection and no caching of API responses
- **Private Logs** - Email addresses are masked in server logs

### � **Advanced Automation & Tracking**

- **Automated Market Scanner** - Multi-channel scanner using News API and YouTube API to fetch real-time schemes and courses
- **Granular Activity Tracking** - Detailed logging of course enrollments, resource views, AI queries, and forum interactions
- **Behavioral Analytics** - Admin-level visibility into user engagement and platform usage trends
- **Intelligent Knowledge Infusion** - Seamless integration of scraped market data into the platform's resource base
- **Email Notifications** - Automated summaries of new additions sent to stakeholders via Brevo API

### �📊 **Comprehensive APIs**

<details>
<summary><b>📍 Authentication API</b> - <code>/api/auth/*</code></summary>

<br>

User registration, login, token management, OAuth integration

**Key Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

</details>

<details>
<summary><b>👤 User Management API</b> - <code>/api/users/*</code></summary>

<br>

Profile CRUD, preferences, activity tracking, statistics

**Key Endpoints:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `POST /api/users/upload-avatar` - Upload profile picture

</details>

<details>
<summary><b>🤖 AI Assistant API</b> - <code>/api/ai/*</code></summary>

<br>

Chat interface, voice processing, smart recommendations

**Key Endpoints:**
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/recommendations` - Get personalized recommendations
- `POST /api/ai/voice` - Process voice input
- `GET /api/ai/suggestions` - Get smart suggestions

</details>

<details>
<summary><b>📚 Resources API</b> - <code>/api/resources/*</code></summary>

<br>

Government schemes, job listings, NGO programs, search & filter

**Key Endpoints:**
- `GET /api/resources/schemes` - List government schemes
- `GET /api/resources/jobs` - List job opportunities
- `GET /api/resources/search` - Search resources
- `GET /api/resources/{id}` - Get resource details

</details>

<details>
<summary><b>🎓 Learning Hub API</b> - <code>/api/learning/*</code></summary>

<br>

Courses, progress tracking, certificates, enrollments

**Key Endpoints:**
- `GET /api/learning/courses` - List all courses
- `POST /api/learning/enroll` - Enroll in course
- `GET /api/learning/progress` - Get learning progress
- `POST /api/learning/complete` - Mark lesson complete

</details>

<details>
<summary><b>⚙️ Admin Panel API</b> - <code>/api/admin/*</code></summary>

<br>

Content management, analytics, user moderation, dashboard

**Key Endpoints:**
- `GET /api/admin/overview` - Everything the admin dashboard needs in one request
- `POST /api/admin/resources` - Add new resource
- `GET /api/admin/analytics` - Get platform analytics
- `PUT /api/admin/users/{id}` - Moderate users
- `DELETE /api/admin/content/{id}` - Remove content

</details>

<details>
<summary><b>🔧 Agent System API</b> - <code>/api/agent/*</code></summary>

<br>

Intelligent routing, task automation, workflow management

**Key Endpoints:**
- `POST /api/agent/task` - Create automated task
- `GET /api/agent/status` - Check task status
- `POST /api/agent/workflow` - Execute workflow

</details>

### 🚀 **Performance Optimized**

- **Async/Await** - Non-blocking I/O for high concurrency
- **Lifespan Management** - Modern FastAPI lifespan handlers for robust startup/shutdown
- **Background Tasks** - Non-blocking email dispatch (OTP) via Brevo API
- **Connection Pooling** - Efficient database connections
- **Response Caching** - Redis integration ready
- **Lazy Loading** - Optimized query performance
- **Gzip Compression** - Reduced payload sizes

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway Layer                        │
│                         (FastAPI)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   CORS       │  │   Auth       │  │   Rate Limiting      │  │
│  │  Middleware  │  │  Middleware  │  │   Middleware         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Auth Service  │   │   AI Service    │   │ Resource Mgmt  │
│                │   │                 │   │                │
│ • Registration │   │ • Chat Engine   │   │ • Gov Schemes  │
│ • Login/Logout │   │ • NLP Pipeline  │   │ • Job Listings │
│ • JWT Tokens   │   │ • Multi-Model   │   │ • NGO Programs │
│ • OAuth2       │   │ • Voice I/O     │   │ • Search/Filter│
└────────────────┘   └─────────────────┘   └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                          │
│                      (SQLAlchemy ORM)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Models     │  │   Schemas    │  │   Repositories       │  │
│  │  Definition  │  │  Validation  │  │   Pattern            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Turso     │  │   SQLite     │  │   Connection Pool    │  │
│  │  (Production)│  │  (Dev/Test)  │  │   Management         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Groq AI    │  │ Google OAuth │  │   File Storage       │  │
│  │   API        │  │   Service    │  │   (Local/S3)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Core Framework**
```python
FastAPI 0.104+      # Modern, high-performance web framework
Uvicorn            # Lightning-fast ASGI server
Pydantic 2.0+      # Data validation using Python type hints
```

### **Frontend**
```text
React 18 + Vite        # UI and build tool
React Router           # Routing
Framer Motion          # Animation
Lucide React           # Icons
Axios                  # API client
@react-oauth/google    # Google sign-in
```

### **Database & ORM**
```python
SQLAlchemy 2.0+    # Powerful SQL toolkit and ORM
Turso (libSQL)     # Production database
SQLite             # Local development and tests
```

### **Authentication & Security**
```python
python-jose[cryptography]  # JWT token generation
passlib[bcrypt]            # Password hashing
python-multipart           # Form data parsing
```

### **AI & Machine Learning**
```python
groq               # Fast AI inference
google-generativeai # Gemini AI integration
langdetect         # Language detection
```

### **Development Tools**
```python
pytest             # Testing framework
black              # Code formatting
flake8             # Linting
mypy               # Static type checking
```

---

## 🚀 Quick Start

### Prerequisites

```bash
✅ Python 3.10 or higher
✅ Node.js 22 (frontend, same as CI)
✅ pip (Python package manager)
✅ Git
✅ Virtual environment tool (venv/virtualenv)
```

### Installation

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/RiteshKumar2e/Community-Empowering.git
cd Community-Empowering/backend
```

#### 2️⃣ **Create Virtual Environment**

**Windows:**
```powershell
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3️⃣ **Install Dependencies**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4️⃣ **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Security
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Services (Primary & Fallback)
GROQ_API_KEY=your-groq-api-key-here
GOOGLE_API_KEY=your-google-gemini-key-here

# AWS Cloud Services (Advanced AI)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_Q_APPLICATION_ID=your-amazon-q-app-id

# External APIs
NEWS_API_KEY=your-news-api-key             # For Market Scanner
YOUTUBE_API_KEY=your-youtube-api-key       # For Learning Hub Scanner
BREVO_API_KEY=your-brevo-api-key           # For Email Service

# DB & CORS
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
# Local development. In production use Turso (see "Turso Database"):
# DATABASE_URL=libsql://your-db.turso.io?authToken=your-token
DATABASE_URL=sqlite:///./community_ai.db
MAX_UPLOAD_SIZE=5242880
UPLOAD_DIR=./uploads
```

#### 5️⃣ **Initialize Database**

```bash
# The database will be created automatically on first run
python main.py
```

#### 6️⃣ **Run the Server**

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 7️⃣ **Run the Frontend**

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` to your backend URL. Use `npm ci`, and avoid `npm audit fix --force`: it can jump major versions and break the build.

#### 8️⃣ **Access the API**

- **API Base URL:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

---

## 📚 API Reference

### 🔐 Authentication Endpoints

<details>
<summary><b>POST</b> <code>/api/auth/register</code> - Register New User</summary>

<br>

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "location": "Mumbai, Maharashtra",
  "language_preference": "en",
  "community_type": "urban"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

</details>

<details>
<summary><b>POST</b> <code>/api/auth/login</code> - User Login</summary>

<br>

**Request:**
```
Content-Type: application/x-www-form-urlencoded

username=john@example.com
password=SecurePass123!
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

</details>

### 🤖 AI Assistant Endpoints

<details>
<summary><b>POST</b> <code>/api/ai/chat</code> - Chat with AI</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "message": "What government schemes are available for farmers?",
  "language": "en",
  "context": {
    "location": "Punjab",
    "user_type": "farmer"
  }
}
```

**Response:** `200 OK`
```json
{
  "response": "Here are the key schemes for farmers in Punjab...",
  "suggestions": [
    "PM-KISAN Scheme",
    "Crop Insurance",
    "Soil Health Card"
  ],
  "language": "en"
}
```

</details>

<details>
<summary><b>GET</b> <code>/api/ai/recommendations</code> - Get AI Recommendations</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?category=education&limit=5
```

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Digital Literacy Course",
      "type": "course",
      "relevance_score": 0.95
    }
  ]
}
```

</details>

### 📊 Resource Management

<details>
<summary><b>GET</b> <code>/api/resources/schemes</code> - List Government Schemes</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?category=education&location=Delhi
```

**Response:** `200 OK`
```json
{
  "total": 15,
  "schemes": [
    {
      "id": 1,
      "title": "PM Scholarship Scheme",
      "description": "Financial assistance for students",
      "eligibility": "Students from economically weaker sections",
      "deadline": "2024-03-31",
      "link": "https://..."
    }
  ]
}
```

</details>

### 🎓 Learning Hub

<details>
<summary><b>POST</b> <code>/api/learning/enroll</code> - Enroll in Course</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "course_id": 5
}
```

**Response:** `201 Created`
```json
{
  "enrollment_id": 123,
  "course_title": "Python Programming Basics",
  "progress": 0,
  "enrolled_at": "2024-01-23T15:30:00Z"
}
```

</details>

### 👤 User Management

<details>
<summary><b>GET</b> <code>/api/users/profile</code> - Get User Profile</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "location": "Mumbai, Maharashtra",
  "language_preference": "en",
  "community_type": "urban",
  "created_at": "2024-01-01T00:00:00Z",
  "stats": {
    "courses_enrolled": 3,
    "courses_completed": 1,
    "queries_asked": 25
  }
}
```

</details>

<details>
<summary><b>PUT</b> <code>/api/users/profile</code> - Update Profile</summary>

<br>

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Smith",
  "location": "Delhi",
  "language_preference": "hi"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "location": "Delhi"
  }
}
```

</details>

### 🔧 Admin Endpoints

<details>
<summary><b>POST</b> <code>/api/admin/resources</code> - Add New Resource</summary>

<br>

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "New Skill Development Program",
  "description": "Free training for youth",
  "category": "education",
  "location": "All India",
  "deadline": "2024-12-31"
}
```

**Response:** `201 Created`
```json
{
  "id": 42,
  "title": "New Skill Development Program",
  "message": "Resource added successfully"
}
```

</details>

---

## 🗄️ Database Schema

### **Entity Relationship Diagram**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Users       │         │  Enrollments    │         │    Courses      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────►│ id (PK)         │◄───────►│ id (PK)         │
│ name            │    1:N  │ user_id (FK)    │   N:1   │ title           │
│ email (UNIQUE)  │         │ course_id (FK)  │         │ description     │
│ password_hash   │         │ progress        │         │ level           │
│ phone           │         │ completed       │         │ duration        │
│ location        │         │ enrolled_at     │         │ lessons (JSON)  │
│ language_pref   │         │ completed_at    │         │ thumbnail       │
│ community_type  │         └─────────────────┘         │ created_at      │
│ is_admin        │                                     └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Queries      │         │   Resources     │         │ LearningPlatform│
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │         │ title           │         │ name            │
│ message         │         │ description     │         │ description     │
│ response        │         │ category        │         │ url             │
│ language        │         │ eligibility     │         │ category        │
│ created_at      │         │ location        │         │ is_free         │
└─────────────────┘         │ deadline        │         │ created_at      │
                            │ link            │         └─────────────────┘
                            │ is_new          │
                            │ created_at      │
                            └─────────────────┘
```

### **Key Models**

<details>
<summary><b>User Model</b></summary>

<br>

```python
class User(Base):
    __tablename__ = "users"
    
    id: int (Primary Key)
    name: str (Required)
    email: str (Unique, Indexed)
    password_hash: str (Bcrypt)
    phone: str (Optional)
    location: str (Optional)
    language_preference: str (Default: "en")
    community_type: str (Optional)
    is_admin: bool (Default: False)
    profile_picture: str (Optional)
    created_at: datetime (Auto)
    updated_at: datetime (Auto)
```

</details>

<details>
<summary><b>Course Model</b></summary>

<br>

```python
class Course(Base):
    __tablename__ = "courses"
    
    id: int (Primary Key)
    title: str (Required)
    description: str (Required)
    level: str (beginner/intermediate/advanced)
    duration: int (in hours)
    lessons: JSON (Structured content)
    thumbnail: str (Image URL)
    created_at: datetime (Auto)
```

</details>

<details>
<summary><b>Enrollment Model</b></summary>

<br>

```python
class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id: int (Primary Key)
    user_id: int (Foreign Key → users.id)
    course_id: int (Foreign Key → courses.id)
    progress: int (0-100)
    completed: bool (Default: False)
    enrolled_at: datetime (Auto)
    completed_at: datetime (Optional)
```

</details>

<details>
<summary><b>Resource Model</b></summary>

<br>

```python
class Resource(Base):
    __tablename__ = "resources"
    
    id: int (Primary Key)
    title: str (Required)
    description: str (Required)
    category: str (Required)
    eligibility: str (Optional)
    location: str (Optional)
    deadline: date (Optional)
    link: str (Optional)
    is_new: bool (Default: True)
    created_at: datetime (Auto)
```

</details>

---

## 🔐 Authentication & Security

### **JWT Token Flow**

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │  Server │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  1. POST /api/auth/login                    │
     │  {email, password}                          │
     ├────────────────────────────────────────────►│
     │                                              │
     │                                              │ 2. Validate
     │                                              │    Credentials
     │                                              │
     │  3. Return JWT Token                        │
     │  {access_token, token_type}                 │
     │◄────────────────────────────────────────────┤
     │                                              │
     │  4. Subsequent Requests                     │
     │  Authorization: Bearer {token}              │
     ├────────────────────────────────────────────►│
     │                                              │
     │                                              │ 5. Verify Token
     │                                              │    Extract User
     │                                              │
     │  6. Protected Resource                      │
     │◄────────────────────────────────────────────┤
     │                                              │
```

### **Security Features**

#### ✅ **Password Security**
- Bcrypt hashing with salt rounds
- Minimum password strength requirements
- Password reset with email verification

#### ✅ **Token Management**
- JWT with HS256 algorithm
- Configurable expiration (default: 7 days)
- Token blacklisting for logout

#### ✅ **Input Validation**
- Pydantic models for all requests
- SQL injection prevention via ORM
- XSS protection through sanitization
- CSRF token support

#### ✅ **CORS Configuration**
```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-frontend.vercel.app"
]
```

---

## 🤖 AI Integration

### **Multi-Model Architecture**

The platform uses an intelligent fallback system with **50+ AI models** across multiple providers:

**Priority Chain:** Amazon Q → Groq → Gemini

```python
AI_MODELS = [
    # Ultra-Fast Chat Models (Groq)
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    
    # High-Performance Reasoning
    "deepseek-r1-distill-llama-70b",
    "qwen-2.5-72b-instruct",
    
    # Specialized Models
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    
    # Fallback Options
    "llama3-8b-8192",
    "gemma-7b-it"
]
```

---

### **🔷 Amazon Q Business Integration**

Amazon Q provides intelligent business analytics and source-attributed Q&A:

#### **Key Features**

🎯 **Source-Attributed Answers** - Every response includes citations and sources  
📊 **Business Intelligence** - Automated insights from platform metrics  
🎓 **Personalized Learning Paths** - AI-generated skill development roadmaps  
🔍 **Query Intent Analysis** - Understand user needs and route appropriately  
🏛️ **Scheme Recommendations** - Context-aware government program suggestions  
🌐 **Language Detection** - Automatic identification of user language  

#### **Amazon Q Capabilities**

<details>
<summary><b>Intelligent Q&A</b></summary>

<br>

```python
response = await amazon_q.ask_question(
    question="What government schemes are available for farmers?",
    context={"location": "Punjab", "community_type": "rural"},
    user_id="user_123"
)

# Returns:
{
    "answer": "Here are the key schemes for farmers in Punjab...",
    "sources": [
        {
            "title": "PM-KISAN Scheme",
            "url": "https://...",
            "snippet": "Direct income support..."
        }
    ],
    "conversation_id": "conv_xyz",
    "message_id": "msg_abc"
}
```

</details>

<details>
<summary><b>Query Analysis</b></summary>

<br>

Analyzes user intent and extracts key information:

```python
analysis = await amazon_q.analyze_query(
    query="I need help finding a job in IT sector"
)

# Returns:
{
    "intent": "employment_search",
    "category": "employment",
    "keywords": ["job", "IT", "sector"],
    "suggested_action": "Show IT job listings",
    "urgency": "medium"
}
```

</details>

<details>
<summary><b>Learning Path Generation</b></summary>

<br>

Creates personalized learning roadmaps:

```python
path = await amazon_q.get_learning_path(
    goals=["Python Developer", "Machine Learning"],
    current_skills=["Basic Programming", "Mathematics"]
)

# Returns structured learning path with:
# - Step-by-step progression
# - Recommended courses
# - Estimated timeline
# - Key milestones
```

</details>

<details>
<summary><b>Business Insights</b></summary>

<br>

Analyzes platform metrics and provides recommendations:

```python
insights = await amazon_q.get_business_insights(
    metrics={
        "active_users": 1500,
        "course_enrollments": 450,
        "avg_session_time": "12 minutes"
    },
    time_period="last_month"
)

# Returns:
# - Key insights and trends
# - Recommendations for improvement
# - Potential issues to address
```

</details>

#### **💰 Amazon Q Business Pricing**

| Tier | Price | Features |
|------|-------|----------|
| **Amazon Q Business Lite** | **$3/user/month** | • Basic Q&A functionality<br>• Permission-aware responses<br>• Secure data connection<br>• Basic knowledge access |
| **Amazon Q Business Pro** | **$20/user/month** | • **All Lite features, plus:**<br>• Amazon Q Apps access<br>• QuickSight integration<br>• Extended content generation<br>• Structured data querying<br>• Image-based responses<br>• Third-party plugin integration |

**Additional Costs:**
- **Index Capacity Charges** - Based on data indexed
- **API Call Charges** - For programmatic access
- **Data Transfer** - Standard AWS data transfer rates apply

**💡 Cost Optimization:**
- Start with **Lite tier** for basic chatbot functionality
- Upgrade to **Pro** only when advanced features are needed
- Monitor index capacity to control storage costs
- Use caching to reduce redundant API calls
- Consider usage limits when scaling

---

### **AI Service Features**

#### 🌐 **Multilingual Support**
- Automatic language detection via Amazon Q
- Response generation in user's preferred language
- Translation support for 5+ Indian languages
- Context-aware language switching

#### 🎯 **Context-Aware Responses**
```python
context = {
    "user_location": "Punjab",
    "user_type": "farmer",
    "previous_queries": [...],
    "user_preferences": {...},
    "community_type": "rural"
}
```

#### 💡 **Smart Recommendations**
- **Collaborative filtering** - Based on similar user behavior
- **Content-based filtering** - Based on user profile and interests
- **Hybrid recommendation engine** - Combines multiple approaches
- **Amazon Q powered** - AI-driven personalized suggestions

#### 🔄 **Intelligent Fallback System**

```
User Query
    ↓
┌─────────────────────────────────────┐
│  Phase 1: Try Amazon Q              │
│  - Source-attributed answers        │
│  - Business intelligence            │
└─────────────────────────────────────┘
    ↓ (if unavailable)
┌─────────────────────────────────────┐
│  Phase 2: Try Groq                  │
│  - 30+ fast inference models        │
│  - Ultra-low latency                │
└─────────────────────────────────────┘
    ↓ (if unavailable)
┌─────────────────────────────────────┐
│  Phase 3: Try Google Gemini         │
│  - Final fallback option            │
└─────────────────────────────────────┘
```

Using two providers means the assistant keeps working if one provider or model is unavailable. (No uptime figure is published because none has been measured.)

---

## 🚀 Deployment

### **Vercel Deployment (Recommended)**

#### 1️⃣ **Install Vercel CLI**

```bash
npm install -g vercel
```

#### 2️⃣ **Configure vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

#### 3️⃣ **Deploy**

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### 4️⃣ **Environment Variables**

Set these in Vercel Dashboard:

```env
SECRET_KEY=<your-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GROQ_API_KEY=<your-groq-key>
GOOGLE_API_KEY=<your-google-key>
ALLOWED_ORIGINS=["https://your-app.vercel.app"]
DATABASE_URL=<your-database-url>
```

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```



---

### **💾 Turso Database**

Production uses [Turso](https://turso.tech) (libSQL, SQLite-compatible). The backend reads one variable, which holds both the database URL and the auth token:

```bash
DATABASE_URL=libsql://your-db.turso.io?authToken=your-token
```

Without it the backend falls back to a local SQLite file, which is wiped on every Render deploy, so always set it on Render.

```bash
# Tables are created automatically when the server starts
python main.py
```

#### **Things to know**

- **Keep the database near the backend.** The Turso driver blocks the whole Python process during each query, so every query costs the full network round trip. Put the Turso database in the same region as the Render service.
- **One connection per request.** The engine uses `QueuePool`. Never share one libSQL connection between requests: concurrent use makes the Rust driver panic.
- **Idle connections are replaced.** Turso closes idle streams (`stream not found`), so connections idle for more than 5 seconds are reopened automatically.
- **Few round trips.** Use batched queries instead of one query per row. The admin dashboard loads through a single `/api/admin/overview` request for the same reason.

#### **Keeping the Render free instance awake**

A free Render instance sleeps after 15 minutes without traffic, and the next request can take 50+ seconds. Point an uptime monitor at the backend, not the frontend:

```
https://community-empowering-2-0.onrender.com/health
```

`/health` answers both GET and HEAD and does not touch the database. Keep the interval under 15 minutes (5 minutes works).

---

### **Production Checklist**

- [ ] Set strong `SECRET_KEY` (32+ characters)
- [ ] Set `DATABASE_URL` to the Turso URL with its auth token (see "Turso Database")
- [ ] Keep the Turso database in the same region as the backend
- [ ] Set up HTTPS/SSL certificates (auto on Vercel)
- [ ] Enable CORS for production domains only
- [ ] Configure rate limiting
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Check the backup options on your Turso plan
- [ ] Configure CDN (built-in on Vercel)
- [ ] Set up CI/CD pipeline (auto on Vercel)
- [ ] Enable logging and analytics
- [ ] Monitor database usage in the Turso dashboard
- [ ] Set up AWS credentials for Amazon Q (if using)

---

## ⚡ Performance & Optimization

### **Performance Metrics**

Response-time, throughput and uptime figures have not been measured on the production deployment yet, so none are published here. Measure them with Render's metrics and an external uptime monitor before adding numbers.

### **Optimization Techniques**

#### 🚀 **Async Operations**
```python
@router.get("/resources")
async def get_resources(db: AsyncSession = Depends(get_db)):
    # Non-blocking database queries
    resources = await db.execute(select(Resource))
    return resources.scalars().all()
```

#### 💾 **Database Optimization**
- Indexed columns for fast lookups
- One pooled connection per request (`QueuePool`)
- Batched queries instead of one query per row
- Lazy loading for relationships

#### 📦 **Response Compression**
```python
# Gzip compression for responses > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### ⚡ **Caching Strategy**
```python
# Redis caching (ready to integrate)
@cache(expire=3600)  # Cache for 1 hour
async def get_popular_courses():
    return await db.query(Course).filter(Course.is_popular).all()
```

---

## 📊 Monitoring & Logging

### **Health Check Endpoint**

```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2024-01-23T15:30:00Z",
  "version": "1.0.0",
  "platform": "vercel",
  "database": "connected",
  "ai_service": "operational"
}
```

### **Logging Configuration**

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

---

## 🧪 Testing

### **Backend**

```bash
cd backend
python -m pytest tests -q
```

Tests run on a throwaway SQLite file and never touch the production database. Emails are stubbed.

```
tests/
├── test_signup_funnel.py   # Signup, saved schemes, reset, admin, forum speed, health
└── test_security.py        # Access control, OTP limits, uploads, CORS, headers
```

### **Frontend**

```bash
cd frontend
npm run build           # Build and prerender public pages
npm run test:seo        # Metadata, sitemap, robots.txt, llms.txt, internal links
npm run test:security   # Redirect allowlist
npm run lint            # ESLint
```

CI runs on pushes to `main` and on pull requests (`.github/workflows/ci.yml`).

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   pytest
   black .
   flake8
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### **Code Standards**

- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for public APIs
- Maintain test coverage > 80%
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Ritesh Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

For more details, please see the [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

Built with ❤️ for communities across India

### **Special Thanks**

- **FastAPI** - For the amazing framework
- **Groq** - For lightning-fast AI inference
- **AI Bharat** - For the inspiration and mission
- **Open Source Community** - For the tools and libraries

---

## 📞 Support & Contact

### **Get Help**

- 📧 **Email:** support@communityai.in
- 🐛 **Issues:** [GitHub Issues](https://github.com/RiteshKumar2e/Community-Empowering/issues)
- 📖 **Documentation:** [Live Docs](https://communityai.co.in/docs)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/RiteshKumar2e/Community-Empowering/discussions)

### **Links**

- 🌐 **Live:** https://communityai.co.in/
- 📚 **Documentation:** https://communityai.co.in/docs
- 💻 **GitHub:** https://github.com/RiteshKumar2e/Community-Empowering
- 🎨 **Frontend:** https://communityai.co.in/

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Made with 💙 by [Ritesh Kumar](https://github.com/RiteshKumar2e)**

*Empowering Communities, One API Call at a Time* 🚀

---

[![GitHub Stars](https://img.shields.io/github/stars/RiteshKumar2e/Community-Empowering?style=social)](https://github.com/RiteshKumar2e/Community-Empowering)
[![GitHub Forks](https://img.shields.io/github/forks/RiteshKumar2e/Community-Empowering?style=social)](https://github.com/RiteshKumar2e/Community-Empowering/fork)
[![GitHub Issues](https://img.shields.io/github/issues/RiteshKumar2e/Community-Empowering)](https://github.com/RiteshKumar2e/Community-Empowering/issues)

</div>
