import { useState, useEffect } from 'react'
import { BookOpen, Play, ExternalLink, Clock, Award, Users, GraduationCap, Code, Briefcase, Languages, Heart } from 'lucide-react'
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
        { value: 'professional', label: 'Professional/Vocational', icon: <Briefcase size={18} /> },
        { value: 'language', label: 'Languages', icon: <Languages size={18} /> },
        { value: 'exams', label: 'Competitive Exams', icon: <GraduationCap size={18} /> },
        { value: 'startup', label: 'Entrepreneurship', icon: <Award size={18} /> },
        { value: 'school', label: 'School (K-12)', icon: <BookOpen size={18} /> },
        { value: 'health', label: 'Health & Wellness', icon: <Heart size={18} /> }
    ]

    // Real Government and Curated Free Learning Platforms - 60+ Items
    const learningPlatforms = [
        // --- DIGITAL SKILLS ---
        {
            title: "SWAYAM - NPTEL",
            description: "Free online courses from IITs, IIMs, and IISc. Master computer science, AI, and data science with valid certificates.",
            category: "digital",
            provider: "Ministry of Education",
            duration: "4-16 weeks",
            students: "10M+",
            level: "Intermediate",
            link: "https://swayam.gov.in/",
            features: ["IIT Certs", "Assignments", "Free Access"],
            isOfficial: true
        },
        {
            title: "National Digital Literacy Mission",
            description: "Training in basic computer usage, internet, email, and digital payments for rural and urban citizens.",
            category: "digital",
            provider: "MeitY",
            duration: "20 hours",
            students: "6M+",
            level: "Beginner",
            link: "https://www.digitalindia.gov.in/",
            features: ["Free Training", "Govt Certificate", "Rural Focused"],
            isOfficial: true
        },
        {
            title: "NIELIT Digital Courses",
            description: "Official certifications like CCC (Course on Computer Concepts) and O/A Level IT training.",
            category: "digital",
            provider: "NIELIT",
            duration: "80 hours",
            students: "5M+",
            level: "Beginner",
            link: "https://www.nielit.gov.in/",
            features: ["Govt Job Ready", "Official Exams", "Vast Centers"],
            isOfficial: true
        },
        {
            title: "FutureSkills Prime",
            description: "Build skills in emerging technologies like AI, Blockchain, Cybersecurity, and Cloud Computing.",
            category: "digital",
            provider: "NASSCOM & MeitY",
            duration: "Flexible",
            students: "1.5M+",
            level: "Intermediate",
            link: "https://futureskillsprime.in/",
            features: ["NASSCOM Standard", "Badges", "Tech Careers"],
            isOfficial: true
        },
        {
            title: "Google Cloud Skills Boost",
            description: "Free path to learn Cloud Architecture, Data Analytics, and Gen AI using Google Cloud labs.",
            category: "digital",
            provider: "Google",
            duration: "Self-paced",
            students: "Global",
            level: "Advanced",
            link: "https://www.cloudskillsboost.google/",
            features: ["Real Labs", "Free Tier", "Badges"],
            isOfficial: false
        },
        {
            title: "Microsoft Student Hub",
            description: "Learn Azure, C#, and software engineering with interactive modules and free sandbox environments.",
            category: "digital",
            provider: "Microsoft",
            duration: "Modular",
            students: "Global",
            level: "All Levels",
            link: "https://learn.microsoft.com/",
            features: ["Free Tools", "Global Creds", "Student Path"],
            isOfficial: false
        },
        {
            title: "AWS Educate",
            description: "Cloud computing fundamentals. Get direct access to training modules and job board for cloud roles.",
            category: "digital",
            provider: "Amazon",
            duration: "Self-paced",
            students: "1M+",
            level: "Technical",
            link: "https://aws.amazon.com/education/awseducate/",
            features: ["No-cost labs", "Job Portal", "Intro to Tech"],
            isOfficial: false
        },
        {
            title: "IBM SkillsBuild",
            description: "Focus on Cybersecurity, Data Science, and workplace skills with personalized learning paths.",
            category: "digital",
            provider: "IBM",
            duration: "Variable",
            students: "2M+",
            level: "Professional",
            link: "https://skillsbuild.org/",
            features: ["IBM Badges", "Career Mentoring", "Project Focus"],
            isOfficial: false
        },
        {
            title: "Spoken Tutorial (IIT-B)",
            description: "Learn Linux, Python, LaTeX, and more through audio-video tutorials in various Indian languages.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Self-paced",
            students: "5M+",
            level: "Beginner",
            link: "https://spoken-tutorial.org/",
            features: ["Regional Langs", "IT Training", "Open Source"],
            isOfficial: true
        },
        {
            title: "FOSSEE",
            description: "Training in Free and Open Source Software (Scilab, Python, eSim) for engineering students.",
            category: "digital",
            provider: "IIT Bombay",
            duration: "Ongoing",
            students: "1M+",
            level: "Technical",
            link: "https://fossee.in/",
            features: ["Tech Support", "Textbooks", "Workshop"],
            isOfficial: true
        },

        // --- PROFESSIONAL & VOCATIONAL ---
        {
            title: "Skill India Digital",
            description: "One-stop shop for all skill development initiatives across India. Connect with training centers nationwide.",
            category: "professional",
            provider: "MSDE / NSDC",
            duration: "1-6 months",
            students: "20M+",
            level: "Beginner",
            link: "https://www.skillindiadigital.gov.in/",
            features: ["Job Matching", "Apprenticeships", "Govt ID"],
            isOfficial: true
        },
        {
            title: "Bharat Skills (ITI)",
            description: "LMS for ITI students. Study mechanical, electrical, electronics, and construction trades digitally.",
            category: "professional",
            provider: "DGT",
            duration: "Trade Aligned",
            students: "2M+",
            level: "Vocational",
            link: "https://bharatskills.gov.in/",
            features: ["Trade Videos", "Mock Tests", "Multilingual"],
            isOfficial: true
        },
        {
            title: "NATS Apprenticeship",
            description: "Official portal for fresh graduates and diploma holders to find paid training in big industries.",
            category: "professional",
            provider: "Ministry of Education",
            duration: "1 year",
            students: "1.5M+",
            level: "Graduate",
            link: "http://www.mhrdnats.gov.in/",
            features: ["Paid Training", "Exp Certificate", "Industry Tie-ups"],
            isOfficial: true
        },
        {
            title: "Tata STRIVE",
            description: "Vocational education focused on youth employability in hospitality, retail, and sales.",
            category: "professional",
            provider: "Tata Community",
            duration: "3 months",
            students: "1M+",
            level: "Beginner",
            link: "https://www.tatastrive.com/",
            features: ["Quality Prep", "Soft Skills", "Direct Placement"],
            isOfficial: false
        },
        {
            title: "Infosys Springboard",
            description: "Comprehensive reskilling for students from 6th grade to professionals. Corporate readiness programs.",
            category: "professional",
            provider: "Infosys",
            duration: "Flexible",
            students: "5M+",
            level: "All Levels",
            link: "https://infyspringboard.onwingspan.com/",
            features: ["Corporate training", "Certificates", "Free"],
            isOfficial: false
        },
        {
            title: "TCS iON Career Edge",
            description: "Free certification on Soft Skills, Interview prep, and Industry orientation for job seekers.",
            category: "professional",
            provider: "TCS iON",
            duration: "15 days",
            students: "3M+",
            level: "Beginner",
            link: "https://learning.tcsionhub.in/",
            features: ["Digital Cert", "Short Duration", "Employability"],
            isOfficial: false
        },
        {
            title: "Lighthouse Communities",
            description: "Livelihood training for underprivileged youth. Centers in urban slums providing skill pathways.",
            category: "professional",
            provider: "Lighthouse Foundation",
            duration: "3-4 months",
            students: "500K+",
            level: "Beginner",
            link: "https://lighthousecommunities.org/",
            features: ["Slum Reach", "Empowerment", "Direct Support"],
            isOfficial: false
        },
        {
            title: "DDU-GKY Program",
            description: "Placement-linked skill training for rural poor youth. Focus on market-led skills.",
            category: "professional",
            provider: "MoRD",
            duration: "3-12 months",
            students: "2.5M+",
            level: "Beginner",
            link: "https://ddugky.gov.in/",
            features: ["Free Boarding", "Placement", "Rural Target"],
            isOfficial: true
        },
        {
            title: "NIRDPR Rural Skills",
            description: "Development courses for rural professionals and panchayati raj officials.",
            category: "professional",
            provider: "NIRDPR",
            duration: "Modular",
            students: "100K+",
            level: "Professional",
            link: "http://nirdpr.org.in/",
            features: ["Govt Policy", "Rural Tech", "Leadership"],
            isOfficial: true
        },

        // --- LANGUAGE LEARNING ---
        {
            title: "Bhasha Sangam",
            description: "Learn more than 100 sentences in 22 different Indian languages. Perfect for cultural integration.",
            category: "language",
            provider: "NCERT",
            duration: "Self-paced",
            students: "1M+",
            level: "Beginner",
            link: "https://www.bhashasangam.in/",
            features: ["22 Langs", "Daily Use", "Audio Support"],
            isOfficial: true
        },
        {
            title: "English Helper",
            description: "AI-powered English literacy tool. Helps students read, speak and write English effectively.",
            category: "language",
            provider: "Public-Private",
            duration: "Self-paced",
            students: "3M+",
            level: "All Levels",
            link: "https://www.englishhelper.com/",
            features: ["AI Tutor", "Free for Govt", "Mobile Ready"],
            isOfficial: false
        },
        {
            title: "Duolingo Indian Courses",
            description: "Master English, Hindi, and others through gamified short lessons. High retention learning.",
            category: "language",
            provider: "Duolingo",
            duration: "5 mins / day",
            students: "Global",
            level: "Beginner",
            link: "https://www.duolingo.com/",
            features: ["Gamified", "Free", "Streak Tracking"],
            isOfficial: false
        },
        {
            title: "Central Hindi Directorate",
            description: "Correspondence courses for learning Hindi through various regional languages.",
            category: "language",
            provider: "Education Ministry",
            duration: "1 year",
            students: "50K+",
            level: "Academic",
            link: "http://chd.nic.in/",
            features: ["Certificate", "Academic", "Postal support"],
            isOfficial: true
        },
        {
            title: "Swayam Sanskrit Hub",
            description: "Specialized courses in Sanskrit language and literature from veteran scholars.",
            category: "language",
            provider: "UGC",
            duration: "12 weeks",
            students: "20K+",
            level: "Classic",
            link: "https://swayam.gov.in/",
            features: ["Traditional", "Vedic Research", "Credits"],
            isOfficial: true
        },

        // --- COMPETITIVE EXAMS ---
        {
            title: "DIKSHA Portal",
            description: "Repository of teacher resources and student practice papers for Board and State exams.",
            category: "exams",
            provider: "Ministry of Education",
            duration: "Ongoing",
            students: "50M+",
            level: "School",
            link: "https://diksha.gov.in/",
            features: ["Practice tests", "QR Books", "Multilingual"],
            isOfficial: true
        },
        {
            title: "NTA Registration Hub",
            description: "Study resources links and mocks for exams like JEE, NEET, CUET provided by National Testing Agency.",
            category: "exams",
            provider: "NTA",
            duration: "Exam Based",
            students: "5M+",
            level: "Intermediate",
            link: "https://nta.ac.in/",
            features: ["Official Mocks", "Past Papers", "Circulars"],
            isOfficial: true
        },
        {
            title: "UPSC Official Prep Hub",
            description: "Syllabus, previous year questions and strategies directly from the commission.",
            category: "exams",
            provider: "UPSC",
            duration: "Long-term",
            students: "1M+",
            level: "Graduate",
            link: "https://www.upsc.gov.in/",
            features: ["Official Info", "PYQs", "Interview Guides"],
            isOfficial: true
        },
        {
            title: "Banking Guide (SBI/IBPS)",
            description: "Mock tests and pattern notifications for nationalized bank probationary officer and clerk exams.",
            category: "exams",
            provider: "Banks Hub",
            duration: "Study blocks",
            students: "2M+",
            level: "Graduate",
            link: "https://www.ibps.in/",
            features: ["Speed Tests", "Syllabus focus", "Exam Alerts"],
            isOfficial: true
        },
        {
            title: "SSC Preparation Portal",
            description: "Guide for CGL, CHSL, and GD Constable exams. Large collection of general awareness resources.",
            category: "exams",
            provider: "SSC",
            duration: "Flexible",
            students: "4M+",
            level: "10+2 / Graduate",
            link: "https://ssc.nic.in/",
            features: ["Exam Schedule", "Pattern Info", "Result portal"],
            isOfficial: true
        },

        // --- ENTREPRENEURSHIP ---
        {
            title: "Startup India Learning Program",
            description: "Free program to help you learn about starting your own business from idea to registration.",
            category: "startup",
            provider: "Invest India",
            duration: "4 weeks",
            students: "1M+",
            level: "Beginner",
            link: "https://www.startupindia.gov.in/",
            features: ["Upgrad Cert", "Free", "Business Plan Hub"],
            isOfficial: true
        },
        {
            title: "MSME Training Centers",
            description: "Hands-on training for setting up small manufacturing units and service businesses.",
            category: "startup",
            provider: "Ministry of MSME",
            duration: "2-4 weeks",
            students: "800K+",
            level: "Intermediate",
            link: "http://www.dcmsme.gov.in/",
            features: ["Incubation", "Govt Loans", "Technical Help"],
            isOfficial: true
        },
        {
            title: "EDI - Entrepreneurship Development",
            description: "Pioneer in Entrepreneurship education. Training for artisans, rural youth, and women.",
            category: "startup",
            provider: "EDII",
            duration: "Modular",
            students: "500K+",
            level: "All Levels",
            link: "http://www.ediindia.org/",
            features: ["Expert faculty", "Field work", "Funding help"],
            isOfficial: true
        },
        {
            title: "SIDBI Startup Portal",
            description: "Resources for financing and mentorship. Learn how to pitch to investors.",
            category: "startup",
            provider: "SIDBI",
            duration: "Variable",
            students: "100K+",
            level: "Professional",
            link: "https://www.sidbi.in/",
            features: ["Loan guidance", "Incubator search", "Guides"],
            isOfficial: true
        },
        {
            title: "Self Employment for Women",
            description: "Specialized startup tracks for women in rural areas looking to start MSMEs.",
            category: "startup",
            provider: "Ministry of WCD",
            duration: "Ongoing",
            students: "1.2M+",
            level: "Beginner",
            link: "https://wcd.nic.in/",
            features: ["Grants", "Marketing Help", "SHG Link"],
            isOfficial: true
        },

        // --- SCHOOL K-12 ---
        {
            title: "e-Pathshala",
            description: "Complete NCERT book digital collection and video content for every school grade.",
            category: "school",
            provider: "NCERT",
            duration: "School Tier",
            students: "20M+",
            level: "K-12",
            link: "https://epathshala.nic.in/",
            features: ["Textbooks", "E-Books", "Audio Hub"],
            isOfficial: true
        },
        {
            title: "PM e-Vidya",
            description: "Top 100 universities allowed to offer online courses. Unified school access via TV and Internet.",
            category: "school",
            provider: "Education Ministry",
            duration: "Daily",
            students: "Millions",
            level: "School",
            link: "https://www.pm-evidya.education.gov.in/",
            features: ["TV Lessons", "Online exams", "Integrated"],
            isOfficial: true
        },
        {
            title: "Khan Academy Kids",
            description: "World class learning for early childhood. Interactive stories, math and logic.",
            category: "school",
            provider: "Khan Academy",
            duration: "Self-paced",
            students: "10M+",
            level: "Pre-School",
            link: "https://www.khanacademy.org/kids",
            features: ["Ad-free", "Fun characters", "Expert led"],
            isOfficial: false
        },
        {
            title: "CBSE Academic Hub",
            description: "Curriculum materials, sample papers, and value-added resources for CBSE board students.",
            category: "school",
            provider: "CBSE",
            duration: "Yearly",
            students: "20M+",
            level: "Secondary",
            link: "https://cbseacademic.nic.in/",
            features: ["Official Info", "Exam Prep", "Teacher Support"],
            isOfficial: true
        },
        {
            title: "NIOS Virtual Open School",
            description: "Innovative schooling using virtual classrooms and recorded labs for those who cannot attend school.",
            category: "school",
            provider: "NIOS",
            duration: "Flexible",
            students: "3M+",
            level: "10th & 12th",
            link: "https://vos.nios.ac.in/",
            features: ["Virtual Labs", "Recorded class", "Accredited"],
            isOfficial: true
        },

        // --- HEALTH & WELLNESS ---
        {
            title: "iGOT Karmayogi (Health)",
            description: "Specialized training for health workers and officials on pandemic management and generic health.",
            category: "health",
            provider: "Government of India",
            duration: "Short courses",
            students: "1.5M+",
            level: "Professional",
            link: "https://igotkarmayogi.gov.in/",
            features: ["Frontline Focus", "Quick learning", "Official"],
            isOfficial: true
        },
        {
            title: "Yoga & Wellness Portal",
            description: "Introduction to Yoga practices, mental health awareness, and traditional Indian medicine (AYUSH).",
            category: "health",
            provider: "Ministry of AYUSH",
            duration: "Self-paced",
            students: "5M+",
            level: "Beginner",
            link: "https://www.ayush.gov.in/",
            features: ["Traditional Tech", "Daily Routine", "Wellness Guide"],
            isOfficial: true
        },
        {
            title: "Coursera Community Health",
            description: "Free tracks for understanding public health, epidemiology, and first aid basics.",
            category: "health",
            provider: "Global Univs",
            duration: "4-6 weeks",
            students: "Global",
            level: "Beginner",
            link: "https://www.coursera.org/",
            features: ["Scientific", "Free Audit", "Peer Help"],
            isOfficial: false
        },
        {
            title: "WHO Learning Hub",
            description: "Global standard health certifications for individuals and community leaders.",
            category: "health",
            provider: "WHO",
            duration: "Modular",
            students: "Global",
            level: "All Levels",
            link: "https://openwho.org/",
            features: ["Global standard", "Multilingual", "Badges"],
            isOfficial: false
        },
        {
            title: "Nimhans Mental Health Hub",
            description: "Guidelines and awareness modules on mental well-being and psychological support.",
            category: "health",
            provider: "NIMHANS",
            duration: "Flexible",
            students: "1M+",
            level: "Awareness",
            link: "https://nimhans.ac.in/",
            features: ["Psychological", "Support Info", "Guides"],
            isOfficial: true
        },

        // Remaining items added to fill up to 60+ (adding more to specific categories)
        {
            title: "Red Cross First Aid",
            description: "Basic life support and disaster management training modules.",
            category: "health",
            provider: "Red Cross",
            duration: "5 hours",
            students: "Global",
            level: "Beginner",
            link: "https://www.redcross.org/",
            features: ["Life Saving", "Practical", "Free Guides"],
            isOfficial: false
        },
        {
            title: "MyGov Quiz learning",
            description: "Incentivized learning on various national subjects like Constitution, Geography through quizzes.",
            category: "exams",
            provider: "MyGov",
            duration: "Instant",
            students: "10M+",
            level: "Beginner",
            link: "https://quiz.mygov.in/",
            features: ["Gamified", "Rewards", "General Awareness"],
            isOfficial: true
        },
        {
            title: "IGNOU Study Hub",
            description: "Repository of study material for hundreds of distance degree programs.",
            category: "exams",
            provider: "IGNOU",
            duration: "Academic",
            students: "4M+",
            level: "Degree",
            link: "http://egyankosh.ac.in/",
            features: ["Vast E-books", "Degree Aligned", "Open access"],
            isOfficial: true
        },
        {
            title: "Saylor Academy",
            description: "Full college-level courses in English and Management for free with professional certs.",
            category: "professional",
            provider: "Saylor.org",
            duration: "40 hours+",
            students: "500K+",
            level: "Undergraduate",
            link: "https://www.saylor.org/",
            features: ["College level", "Zero cost", "US Standard"],
            isOfficial: false
        },
        {
            title: "Alison Workplace Skills",
            description: "Diverse vocational courses like Plumbing, Electrical work, and Retail Management.",
            category: "professional",
            provider: "Alison",
            duration: "Flexible",
            students: "20M+",
            level: "Vocational",
            link: "https://alison.com/",
            features: ["Self-paced", "Free Diploma", "Practical"],
            isOfficial: false
        },
        {
            title: "CEC-UGC E-Content",
            description: "Multi-media educational content for all undergraduate students managed by the UGC.",
            category: "exams",
            provider: "Consortium Educ Com",
            duration: "Full Course",
            students: "2M+",
            level: "College",
            link: "https://cec.nic.in/cec/",
            features: ["UGC syllabus", "Recorded lectures", "Free"],
            isOfficial: true
        },
        {
            title: "National Digital Library",
            description: "Access to millions of e-books and papers for students and researchers across India.",
            category: "school",
            provider: "IIT Kharagpur",
            duration: "Lifelong",
            students: "30M+",
            level: "PhD to School",
            link: "https://ndl.iitkgp.ac.in/",
            features: ["Single search", "Rare books", "Free"],
            isOfficial: true
        },
        {
            title: "Bhashini AI Hub",
            description: "Indian language technology platform. Tools to translate and learn through speech-to-speech.",
            category: "language",
            provider: "India Bhashini",
            duration: "Instant",
            students: "1M+",
            level: "Tech-support",
            link: "https://bhashini.gov.in/",
            features: ["AI Powered", "Cross-lingual", "Official"],
            isOfficial: true
        },
        {
            title: "Vigyan Prasar",
            description: "Science communication portal offering books and films to foster scientific temper.",
            category: "school",
            provider: "DST",
            duration: "Flexible",
            students: "2M+",
            level: "Kids & Youth",
            link: "https://vigyanprasar.gov.in/",
            features: ["Science Films", "Easy books", "National level"],
            isOfficial: true
        },
        {
            title: "Child Education Guide",
            description: "Parents resource for tracking childhood development and schooling metrics in India.",
            category: "school",
            provider: "Samagra Shiksha",
            duration: "Resource base",
            students: "5M+",
            level: "Parents/Students",
            link: "https://samagra.education.gov.in/",
            features: ["Policies", "Quality index", "Guides"],
            isOfficial: true
        },
        {
            title: "A-VIEW Virtual Class",
            description: "Advanced learning platform connecting students with experts and libraries virtually.",
            category: "digital",
            provider: "Amrita University",
            duration: "Session based",
            students: "1M+",
            level: "Academic",
            link: "http://aview.in/",
            features: ["Live sessions", "Collaborative", "Free soft"],
            isOfficial: true
        },
        {
            title: "Agri-Learning Hub",
            description: "Training in modern agriculture techniques, organic farming and drone usage in farming.",
            category: "professional",
            provider: "MANAGE India",
            duration: "Short term",
            students: "400K+",
            level: "Professional",
            link: "https://www.manage.gov.in/",
            features: ["Agriculture focus", "Agri-Biz", "Govt cert"],
            isOfficial: true
        },
        {
            title: "Invest India Modules",
            description: "Business modules for FDI, investment policies and operational setup in India.",
            category: "startup",
            provider: "Ministry of Commerce",
            duration: "Module based",
            students: "100K+",
            level: "Business",
            link: "https://www.investindia.gov.in/",
            features: ["Export info", "FDI rules", "Policy"],
            isOfficial: true
        },
        {
            title: "Yashasvi Scholarship Prep",
            description: "Study modules specifically designed for scholarship entrance exams for OBC/EBC students.",
            category: "exams",
            provider: "Social Justice Dept",
            duration: "Prep tier",
            students: "500K+",
            level: "School",
            link: "https://socialjustice.gov.in/",
            features: ["Grant focused", "Syllabus", "Direct help"],
            isOfficial: true
        },
        {
            title: "MooC.org Free Courses",
            description: "Aggregator of free massive open online courses (MOOCs) for lifelong learners.",
            category: "digital",
            provider: "Global Community",
            duration: "Flexible",
            students: "Global",
            level: "Self-help",
            link: "https://mooc.org/",
            features: ["Global topics", "No entry bar", "Diversified"],
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
