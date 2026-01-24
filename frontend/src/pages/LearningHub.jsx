import { useState, useEffect } from 'react'
import { BookOpen, Play, ExternalLink, Clock, Award, Users, GraduationCap, Code, Briefcase, Languages } from 'lucide-react'
import api from '../services/api'
import '../styles/LearningHub.css'

const LearningHub = () => {
    const [platforms, setPlatforms] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showAll, setShowAll] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                setLoading(true)
                const response = await api.get('/learning/platforms')
                const dbPlatforms = response.data || []

                const combined = [...learningPlatforms]
                dbPlatforms.forEach(dbP => {
                    if (!combined.find(h => h.title === dbP.title)) {
                        combined.unshift(dbP)
                    }
                })

                setPlatforms(combined)
            } catch (error) {
                console.error('Error fetching platforms:', error)
                setPlatforms(learningPlatforms)
            } finally {
                setLoading(false)
            }
        }
        fetchPlatforms()
    }, [])

    const categories = [
        { value: 'all', label: 'All Courses', icon: <BookOpen size={18} /> },
        { value: 'digital', label: 'Digital Skills', icon: <Code size={18} /> },
        { value: 'professional', label: 'Professional', icon: <Briefcase size={18} /> },
        { value: 'language', label: 'Languages', icon: <Languages size={18} /> },
        { value: 'government', label: 'Government Exams', icon: <GraduationCap size={18} /> }
    ]

    // Real Government and Free Learning Platforms
    const learningPlatforms = [
        // Digital Skills & Technology
        {
            title: "SWAYAM - Study Webs of Active Learning",
            description: "Free online courses from Class 9 to Post-Graduation. Courses from IITs, IIMs, Central Universities. Credit transfer facility available.",
            category: "digital",
            provider: "Ministry of Education",
            duration: "4-16 weeks per course",
            students: "10M+ learners",
            level: "All Levels",
            link: "https://swayam.gov.in/",
            features: ["Free Certificates", "Credit Transfer", "Video Lectures", "Assignments"],
            isOfficial: true
        },
        {
            title: "National Digital Literacy Mission (NDLM)",
            description: "Digital literacy training for non-IT literate citizens. Learn basic computer operations, internet usage, email, and digital payments.",
            category: "digital",
            provider: "Ministry of Electronics & IT",
            duration: "20 hours",
            students: "5M+ trained",
            level: "Beginner",
            link: "https://www.digitalindia.gov.in/content/national-digital-literacy-mission-ndlm",
            features: ["Free Training", "Certification", "Practical Sessions"],
            isOfficial: true
        },
        {
            title: "NIELIT - Online Learning",
            description: "IT and Electronics courses. CCC, BCC, O Level, A Level certifications. Recognized by Government of India.",
            category: "digital",
            provider: "NIELIT",
            duration: "3-12 months",
            students: "2M+ certified",
            level: "Beginner to Advanced",
            link: "https://www.nielit.gov.in/",
            features: ["Government Recognized", "Job-Oriented", "Practical Training"],
            isOfficial: true
        },

        // Professional Skills
        {
            title: "Skill India Digital Hub",
            description: "Free skill development courses across 40+ sectors. Industry-recognized certifications. Job placement assistance.",
            category: "professional",
            provider: "Ministry of Skill Development",
            duration: "1-6 months",
            students: "15M+ enrolled",
            level: "All Levels",
            link: "https://www.skillindiadigital.gov.in/",
            features: ["Free Courses", "Industry Certificates", "Job Assistance"],
            isOfficial: true
        },
        {
            title: "PMKVY Training Centers",
            description: "Pradhan Mantri Kaushal Vikas Yojana. Short-term and long-term training programs. Monetary rewards on certification.",
            category: "professional",
            provider: "NSDC",
            duration: "150-300 hours",
            students: "12M+ trained",
            level: "Beginner to Intermediate",
            link: "https://www.pmkvyofficial.org/",
            features: ["Free Training", "Monetary Rewards", "Placement Support"],
            isOfficial: true
        },
        {
            title: "e-Skill India",
            description: "Online platform for skill training. Courses in IT, Electronics, Healthcare, Retail, and more. Free e-learning content.",
            category: "professional",
            provider: "NSDC",
            duration: "Flexible",
            students: "8M+ users",
            level: "All Levels",
            link: "https://eskillindia.org/",
            features: ["Self-Paced", "Industry-Aligned", "Free Access"],
            isOfficial: true
        },

        // Language Learning
        {
            title: "Bhasha Sangam",
            description: "Learn Indian languages. Basic conversational skills in 22 scheduled languages. Interactive multimedia content.",
            category: "language",
            provider: "NCERT",
            duration: "Self-paced",
            students: "1M+ learners",
            level: "Beginner",
            link: "https://www.bhashasangam.in/",
            features: ["22 Languages", "Interactive", "Cultural Context"],
            isOfficial: true
        },
        {
            title: "e-Pathshala",
            description: "Digital textbooks and resources in multiple languages. NCERT books, audio-video content, and interactive modules.",
            category: "language",
            provider: "NCERT",
            duration: "Ongoing",
            students: "5M+ users",
            level: "School Students",
            link: "https://epathshala.nic.in/",
            features: ["Free Textbooks", "Multilingual", "Interactive Content"],
            isOfficial: true
        },

        // Government Exam Preparation
        {
            title: "DIKSHA - Digital Infrastructure for Knowledge Sharing",
            description: "National platform for school education. Content for teachers and students. Aligned with state curricula.",
            category: "government",
            provider: "Ministry of Education",
            duration: "Ongoing",
            students: "20M+ users",
            level: "School to Higher Education",
            link: "https://diksha.gov.in/",
            features: ["State-Specific Content", "QR-Enabled Books", "Teacher Training"],
            isOfficial: true
        },
        {
            title: "NIOS - National Institute of Open Schooling",
            description: "Open schooling for Class 10 and 12. Vocational courses. Flexible learning for working professionals and dropouts.",
            category: "government",
            provider: "Ministry of Education",
            duration: "6 months - 2 years",
            students: "3M+ enrolled",
            level: "Secondary & Senior Secondary",
            link: "https://www.nios.ac.in/",
            features: ["Flexible Schedule", "Recognized Certification", "Vocational Courses"],
            isOfficial: true
        },

        // Additional Free Platforms
        {
            title: "NPTEL - National Programme on Technology Enhanced Learning",
            description: "Engineering and science courses from IITs and IISc. Video lectures, assignments, and exams. Free certificates.",
            category: "digital",
            provider: "IITs & IISc",
            duration: "4-12 weeks",
            students: "8M+ enrolled",
            level: "Undergraduate to Postgraduate",
            link: "https://nptel.ac.in/",
            features: ["IIT Faculty", "Free Certificates", "Credit Transfer"],
            isOfficial: true
        },
        {
            title: "IGNOU - Indira Gandhi National Open University",
            description: "World's largest open university offering affordable distance learning. 200+ programs including degrees, diplomas, and specialized certificates.",
            category: "professional",
            provider: "IGNOU",
            duration: "6 months - 3 years",
            students: "4M+ students",
            level: "All Levels",
            link: "https://www.ignou.ac.in/",
            features: ["UGC Recognized", "Degree Programs", "Very Affordable"],
            isOfficial: true
        },
        {
            title: "National Digital Library of India (NDL)",
            description: "A colossal virtual repository of learning resources covering all academic levels and subjects. Millions of books, journals, and lectures in one place.",
            category: "government",
            provider: "IIT Kharagpur & Ministry of Education",
            duration: "Lifetime Access",
            students: "30M+ users",
            level: "School to PhD",
            link: "https://ndl.iitkgp.ac.in/",
            features: ["Single-Window Search", "Academic Focus", "Multilingual"],
            isOfficial: true
        },
        {
            title: "Spoken Tutorial (IIT Bombay)",
            description: "Self-paced audio-video tutorials in various Indian languages. Master programming, graphic design, and office productivity tools.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Self-paced",
            students: "5M+ trained",
            level: "All Levels",
            link: "https://spoken-tutorial.org/",
            features: ["22 Languages", "IT Training", "Open Source Focus"],
            isOfficial: true
        },
        {
            title: "Virtual Labs",
            description: "Remote access to simulation-based experiments in science and engineering. Perfect for students without access to physical laboratories.",
            category: "digital",
            provider: "Ministry of Education",
            duration: "Ongoing",
            students: "2M+ users",
            level: "Higher Education",
            link: "https://www.vlab.co.in/",
            features: ["Safe Simulations", "Practical Learning", "Technical depth"],
            isOfficial: true
        },
        {
            title: "FOSSEE",
            description: "Free and Open Source Software for Education. Providing high-quality tools like Scilab and Python for tech students across India.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Project-based",
            students: "1M+ contributors",
            level: "Engineering/BCA",
            link: "https://fossee.in/",
            features: ["Open Source", "Software Migration", "Fellowships"],
            isOfficial: true
        },
        {
            title: "CEC Higher Education Portal",
            description: "Dedicated e-content for undergraduate students. Rich video lectures and study material aligned with UGC curriculum standards.",
            category: "government",
            provider: "UGC",
            duration: "UGC Curriculum",
            students: "1.5M+ users",
            level: "Undergraduate",
            link: "https://cec.nic.in/",
            features: ["UGC Standards", "Video Lectures", "Degree Align"],
            isOfficial: true
        },
        {
            title: "Swayam Prabha",
            description: "Educational television broadcasting 24/7. High-quality content for school and higher education accessible via DTH and online.",
            category: "government",
            provider: "Ministry of Education",
            duration: "24/7",
            students: "Millions",
            level: "School to PG",
            link: "https://www.swayamprabha.gov.in/",
            features: ["TV-Based", "No Internet Needed", "All Subjects"],
            isOfficial: true
        },
        {
            title: "NEAT AI Portal",
            description: "Public-private alliance using AI for personalized learning. Bridging the skill gap by offering ed-tech platform access to needy students.",
            category: "professional",
            provider: "AICTE",
            duration: "Variable",
            students: "500K+ coupons",
            level: "Technical Education",
            link: "https://neat.aicte-india.org/",
            features: ["AI Personalization", "Free Vouchers", "Skill-To-Job"],
            isOfficial: true
        },
        {
            title: "AICTE Free Learning Support",
            description: "Providing free access to premium educational products for students. Resources for technical skills, soft skills, and management.",
            category: "professional",
            provider: "AICTE",
            duration: "Self-paced",
            students: "1M+ enrolled",
            level: "Technical/MBA",
            link: "https://free.aicte-india.org/",
            features: ["Industry Tools", "Free Access", "Soft Skills"],
            isOfficial: true
        },
        {
            title: "Khan Academy (Official Hindi)",
            description: "World-class education for anyone, anywhere. Concept-based learning for school subjects entirely in Hindi.",
            category: "language",
            provider: "Khan Academy",
            duration: "Self-paced",
            students: "10M+ users",
            level: "K-12",
            link: "https://hi.khanacademy.org/",
            features: ["Concept-Based", "Practice Sets", "Kids Education"],
            isOfficial: false
        },
        {
            title: "Google Career Certificates",
            description: "Career-focused certifications in high-demand fields like UX Design, Data Analytics, and Project Management.",
            category: "professional",
            provider: "Google",
            duration: "3-6 months",
            students: "5M+ global",
            level: "Beginner",
            link: "https://grow.google/certificates/",
            features: ["Job-Ready Skills", "Industry Leader", "Direct Placement"],
            isOfficial: false
        },
        {
            title: "IBM SkillsBuild",
            description: "Preparing job seekers for the modern workforce. Courses in AI, Cybersecurity, and Professional skills with digital badges.",
            category: "digital",
            provider: "IBM",
            duration: "Self-paced",
            students: "1.7M+ users",
            level: "All Levels",
            link: "https://skillsbuild.org/",
            features: ["IBM Badges", "AI Modules", "Career Mentoring"],
            isOfficial: false
        },
        {
            title: "TCS iON Digital Learning",
            description: "Digital learning solutions targeting employability. Courses on Interview skills, Soft skills, and Industry specifics.",
            category: "professional",
            provider: "TCS iON",
            duration: "2-4 weeks",
            students: "Millions",
            level: "Students/Job Seekers",
            link: "https://learning.tcsionhub.in/",
            features: ["Career Edge", "TCS Standard", "Quick Completion"],
            isOfficial: false
        },
        {
            title: "Microsoft Learn for Students",
            description: "Official path to master Microsoft technologies. Deep dive into Cloud, AI, and developer tools for free.",
            category: "digital",
            provider: "Microsoft",
            duration: "Ongoing",
            students: "3M+ trained",
            level: "Intermediate",
            link: "https://learn.microsoft.com/",
            features: ["Cloud Training", "Sandbox Labs", "Industry Creds"],
            isOfficial: false
        },
        {
            title: "Infosys Springboard",
            description: "A flagship digital learning platform providing courses from Class 6 to working professionals. Focus on digital literacy.",
            category: "professional",
            provider: "Infosys",
            duration: "Self-paced",
            students: "5M+ users",
            level: "All Levels",
            link: "https://infyspringboard.onwingspan.com/",
            features: ["Next-Gen Tech", "Free Certs", "Holistic Growth"],
            isOfficial: false
        },
        {
            title: "Tata STRIVE",
            description: "Empowering youth through vocational training. Skill programs in BFSI, Hospitality, and Retail aimed at immediate jobs.",
            category: "professional",
            provider: "Tata Trusts",
            duration: "3 months",
            students: "1M+ trained",
            level: "Beginner",
            link: "https://www.tatastrive.com/",
            features: ["Vocational focus", "Tata Heritage", "Job Guarantee"],
            isOfficial: false
        },
        {
            title: "Cisco Networking Academy",
            description: "Leading technical training globally. Master Networking, Hardware, and Cybersecurity through simulations and experts.",
            category: "digital",
            provider: "Cisco",
            duration: "3-6 months",
            students: "15M+ global",
            level: "Technical",
            link: "https://www.netacad.com/",
            features: ["Hardware Skills", "Global Creds", "Lab Simulations"],
            isOfficial: false
        },
        {
            title: "AWS Educate",
            description: "Direct path to learning cloud computing. Free labs and training modules on Amazon Web Services for students.",
            category: "digital",
            provider: "Amazon",
            duration: "Self-paced",
            students: "1M+ global",
            level: "Technical",
            link: "https://aws.amazon.com/education/awseducate/",
            features: ["Cloud Path", "Job Portal Access", "No-cost labs"],
            isOfficial: false
        },
        {
            title: "PMGDISHA Rural Digital Literacy",
            description: "Bridging the rural digital divide. Target of reaching 6 crore villagers with basic computer and internet training.",
            category: "digital",
            provider: "MeitY",
            duration: "20 hours",
            students: "60M+ target",
            level: "Beginner",
            link: "https://www.pmgdisha.in/",
            features: ["Rural Focused", "Govt Certified", "Ground Support"],
            isOfficial: true
        },
        {
            title: "Vidwan Academic Portal",
            description: "A database of expertise profiles of scientists/researchers. Vital for academic networking and collaborative research.",
            category: "government",
            provider: "INFLIBNET",
            duration: "Access Based",
            students: "100K Experts",
            level: "PG & Research",
            link: "https://vidwan.inflibnet.ac.in/",
            features: ["Academic Network", "Research Profiles", "Search Experts"],
            isOfficial: true
        },
        {
            title: "Shodhganga Repository",
            description: "A digital repository of Indian electronic theses and dissertations. Open access to high-level research across all streams.",
            category: "government",
            provider: "INFLIBNET",
            duration: "Self-paced",
            students: "5M+ Papers",
            level: "PhD/Reserach",
            link: "https://shodhganga.inflibnet.ac.in/",
            features: ["Doctoral Theses", "Open Research", "Vast Database"],
            isOfficial: true
        },
        {
            title: "Bharat Skills (ITI Learning)",
            description: "The primary learning management system for all ITI students. Video lectures and mock tests for all industrial trades.",
            category: "professional",
            provider: "DGT / MSDE",
            duration: "Trade aligned",
            students: "2M+ users",
            level: "Vocational",
            link: "https://bharatskills.gov.in/",
            features: ["ITI Aligned", "Mock Tests", "Linguistic Support"],
            isOfficial: true
        },
        {
            title: "NATS Apprenticeship Portal",
            description: "Primary portal for technical graduates to secure paid apprenticeship trainings in premier government and private firms.",
            category: "professional",
            provider: "Education Ministry",
            duration: "1 year",
            students: "2M+ learners",
            level: "Technical Graduate",
            link: "http://www.mhrdnats.gov.in/",
            features: ["Paid Training", "Industry Exposure", "Work-ex Cert"],
            isOfficial: true
        },
        {
            title: "English Helper (Public-Private)",
            description: "Technology-enabled English learning. Helping students improve reading and speaking skills through AI-driven tools.",
            category: "language",
            provider: "Public Partnership",
            duration: "Self-paced",
            students: "2M+ users",
            level: "Beginner",
            link: "https://www.englishhelper.com/",
            features: ["AI Speaking", "Reading tool", "Free Platform"],
            isOfficial: false
        },
        {
            title: "LingoHut Indian Languages",
            description: "Learn to communicate in various regional Indian languages. Practical vocabulary for daily use in different states.",
            category: "language",
            provider: "LingoHut",
            duration: "Self-paced",
            students: "1M+",
            level: "Essential",
            link: "https://www.lingohut.com/",
            features: ["Regional focus", "Daily Phrases", "Free Audio"],
            isOfficial: false
        },
        {
            title: "FutureSkills Prime",
            description: "A reskilling/upskilling initiative focusing on 10 emerging technologies like AI, Blockchain, and Big Data.",
            category: "digital",
            provider: "NASSCOM & MeitY",
            duration: "Variable",
            students: "1M+ users",
            level: "Intermediate",
            link: "https://futureskillsprime.in/",
            features: ["NASSCOM Standard", "Govt Supported", "Emerging Tech"],
            isOfficial: true
        },
        {
            title: "Vidya Lakshmi Scholarship",
            description: "Official portal for education loans and scholarships. Apply to multiple banks with a single common application form.",
            category: "government",
            provider: "NSDL / Finance Ministry",
            duration: "Application based",
            students: "1M+ apps",
            level: "Higher Education",
            link: "https://www.vidyalakshmi.co.in/",
            features: ["Loan Tracking", "Scholarship Hub", "Verified Banks"],
            isOfficial: true
        },
        {
            title: "Wipro FutureSkills Training",
            description: "Reskilling platform focusing on industry-relevant technologies and digital literacy for college students.",
            category: "digital",
            provider: "Wipro Talent",
            duration: "Flexible",
            students: "1M+",
            level: "Technical",
            link: "https://wipro.com/talent/careers/",
            features: ["Corporate Prep", "Tech Skills", "Skill Gap Fill"],
            isOfficial: false
        }
    ]

    const filteredPlatforms = selectedCategory === 'all'
        ? platforms
        : platforms.filter(p => p.category === selectedCategory)

    // Show only 4 platforms initially, then all on "View More"
    const displayedPlatforms = showAll ? filteredPlatforms : filteredPlatforms.slice(0, 4)

    return (
        <div className="learning-hub-page">
            <div className="container">
                <div className="page-header">
                    <h1>Learning & Skill Development</h1>
                    <p>Access free government-approved courses and certifications to enhance your skills</p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{platforms.length}+</div>
                            <div className="stat-label">Active Portals</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Award size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Free Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">1000+</div>
                            <div className="stat-label">Certifications</div>
                        </div>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    {categories.map(category => (
                        <button
                            key={category.value}
                            className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(category.value)
                                setShowAll(false) // Reset to show only 4 when changing category
                            }}
                        >
                            {category.icon}
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Learning Platforms Grid */}
                <div className="platforms-grid">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading curated platforms...</p>
                        </div>
                    ) : displayedPlatforms.map((platform, index) => (
                        <div key={index} className="platform-card">
                            <div className="platform-header">
                                <div className="header-badges">
                                    <span className={`badge badge-${platform.level === 'Beginner' ? 'success' :
                                        platform.level === 'Intermediate' ? 'warning' :
                                            platform.level === 'Advanced' ? 'error' :
                                                'info'
                                        }`}>
                                        {platform.level}
                                    </span>
                                    {platform.isOfficial && (
                                        <span className="badge badge-primary">
                                            <Award size={14} />
                                            Official
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3>{platform.title}</h3>
                            <p className="platform-description">{platform.description}</p>

                            <div className="platform-meta">
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <GraduationCap size={16} />
                                        <span>{platform.provider}</span>
                                    </div>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>{platform.duration}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Users size={16} />
                                        <span>{platform.students}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="platform-features">
                                {platform.features.map((feature, idx) => (
                                    <span key={idx} className="feature-tag">
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <div className="platform-actions">
                                <a
                                    href={platform.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                >
                                    <Play size={16} />
                                    Start Learning
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More Button */}
                {filteredPlatforms.length > 4 && (
                    <div className="view-more-section">
                        <button
                            className="view-more-btn"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : `View More (${filteredPlatforms.length - 4} more)`}
                        </button>
                    </div>
                )}

                {/* Additional Resources */}
                <div className="additional-resources">
                    <h2>More Learning Resources</h2>
                    <div className="resources-list">
                        <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <BookOpen size={20} />
                            <div>
                                <h4>Coursera</h4>
                                <p>Free courses from top universities worldwide</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.edx.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <GraduationCap size={20} />
                            <div>
                                <h4>edX</h4>
                                <p>University-level courses in various subjects</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <BookOpen size={20} />
                            <div>
                                <h4>Khan Academy</h4>
                                <p>Free education for anyone, anywhere</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                        <a href="https://www.udemy.com/courses/free/" target="_blank" rel="noopener noreferrer" className="resource-link">
                            <Code size={20} />
                            <div>
                                <h4>Udemy Free Courses</h4>
                                <p>Thousands of free courses on various topics</p>
                            </div>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningHub
