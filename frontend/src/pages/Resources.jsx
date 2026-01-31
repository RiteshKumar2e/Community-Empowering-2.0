import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Search, Filter, ExternalLink, Building, Users, Briefcase, GraduationCap, Heart, Home, Leaf, BookOpen, Award, Baby, Accessibility, Rocket } from 'lucide-react'
import api from '../services/api'
import '../styles/Resources.css'

const Resources = () => {
    const { t } = useLanguage()
    const [resources, setResources] = useState([])
    const [filteredResources, setFilteredResources] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)
    const [selectedSubCategory, setSelectedSubCategory] = useState('all')

    // Track resource view
    const trackResourceView = async (resource) => {
        try {
            await api.post('/tracking/log/resource-view', {
                title: resource.title,
                category: resource.category
            })
        } catch (error) {
            console.log('Tracking error:', error)
        }
    }

    const subCategories = [
        { value: 'all', label: 'All Education' },
        { value: 'higher', label: 'Higher Education' },
        { value: 'backward', label: 'Backward Classes' },
        { value: 'research', label: 'Research Purposes' },
        { value: 'scholarship', label: 'Scholarships' },
        { value: 'age', label: 'Age Group Schemes' }
    ]

    const categories = [
        { value: 'all', label: 'All Resources', icon: <Building size={18} /> },
        { value: 'schemes', label: 'Government Schemes', icon: <Building size={18} /> },
        { value: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { value: 'healthcare', label: 'Healthcare', icon: <Heart size={18} /> },
        { value: 'housing', label: 'Housing', icon: <Home size={18} /> },
        { value: 'agriculture', label: 'Agriculture', icon: <Leaf size={18} /> },
        { value: 'jobs', label: 'Employment', icon: <Briefcase size={18} /> },
        { value: 'women', label: 'Women & Child', icon: <Baby size={18} /> },
        { value: 'disability', label: 'Disability Support', icon: <Accessibility size={18} /> },
        { value: 'startup', label: 'Startups & Business', icon: <Rocket size={18} /> }
    ]

    // Real Government Resources and Schemes - 60+ Verified Items
    const governmentResources = [
        // --- EDUCATION ---
        {
            title: "PM-YASASVI Scheme",
            description: "Pre-Matric and Post-Matric Scholarship for OBC, EBC, and DNT students. Financial assistance for education from Class 9 to Post-Graduation.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "OBC/EBC/DNT students, Family income < ₹2.5 lakh/year",
            link: "https://scholarships.gov.in/",
            provider: "Ministry of Social Justice & Empowerment",
            isNew: true
        },
        {
            title: "National Scholarship Portal",
            description: "One-stop solution for various scholarships from Central and State Governments. Apply for Pre-Matric, Post-Matric, Merit-cum-Means scholarships.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students from Class 1 to Post-Graduation",
            link: "https://scholarships.gov.in/",
            provider: "Government of India"
        },
        {
            title: "SWAYAM - NPTEL",
            description: "Online courses and certification for Higher Education and Career Growth. Courses from IITs and IIMs available for free.",
            category: "education",
            subCategory: "higher",
            eligibility: "All students and lifelong learners",
            link: "https://swayam.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "PMRF (Prime Minister's Research Fellowship)",
            description: "Highest level of research fellowship for students in IITs, IISc, NITs for PhD programs in Science & Technology.",
            category: "education",
            subCategory: "research",
            eligibility: "B.Tech/Masters graduates with high GATE/GPA",
            link: "https://pmrf.in/",
            provider: "Department of Higher Education"
        },
        {
            title: "National Overseas Scholarship",
            description: "Financial assistance to SC, ST, and Landless Labourers' children for pursuing Master's and PhD degrees in foreign universities.",
            category: "education",
            subCategory: "backward",
            eligibility: "SC/ST students with < ₹6 lakh annual family income",
            link: "https://nosmsje.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "Vidya Lakshmi Portal",
            description: "Single window for Students to access Information and apply for Educational Loans provided by banks.",
            category: "education",
            subCategory: "higher",
            eligibility: "All students seeking education loans",
            link: "https://www.vidyalakshmi.co.in/",
            provider: "NSDL / Ministry of Finance"
        },
        {
            title: "AICTE Pragati Scholarship",
            description: "Scholarship for girl students for technical education. Assistance for Tuition Fee and Incidentals.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Girl students in first year of Degree/Diploma",
            link: "https://www.aicte-india.org/schemes/students-development-schemes/pragati",
            provider: "AICTE"
        },
        {
            title: "INSPIRE Fellowship",
            description: "Support for research in Basic and Applied Sciences for university toppers to pursue PhD.",
            category: "education",
            subCategory: "research",
            eligibility: "University 1st rank holders in Science streams",
            link: "https://online-inspire.gov.in/",
            provider: "Department of Science & Technology"
        },
        {
            title: "Pre-Matric Scholarship for ST",
            description: "Financial support to ST students studying in classes 9 and 10 to reduce dropout rates.",
            category: "education",
            subCategory: "backward",
            eligibility: "ST students, Family income < ₹2.5 lakh",
            link: "https://tribal.gov.in/",
            provider: "Ministry of Tribal Affairs"
        },
        {
            title: "Ishan Uday Scholarship",
            description: "Special scholarship for students from the North Eastern Region for general degree, technical and professional courses.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students from NER region only",
            link: "https://scholarships.gov.in/",
            provider: "National Scholarship Portal"
        },
        {
            title: "PM-Poshan (Mid Day Meal)",
            description: "Nutrition scheme for school children. Daily hot cooked meals for students in government schools.",
            category: "education",
            subCategory: "age",
            eligibility: "Children in Class 1 to 8",
            link: "https://pmposhan.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "Samagra Shiksha",
            description: "Integrated school education program. Holistic support from pre-school to senior secondary level.",
            category: "education",
            subCategory: "age",
            eligibility: "All school-going children and teachers",
            link: "https://samagra.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "Balika Samridhi Yojana",
            description: "Financial assistance for the birth and education of girls. Focuses on attitude towards girl children.",
            category: "education",
            subCategory: "age",
            eligibility: "Girl children from BPL families",
            link: "https://wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Kasturba Gandhi Balika Vidyalaya",
            description: "Residential schools at upper primary level for girls belonging to SC, ST, OBC and minorities.",
            category: "education",
            subCategory: "age",
            eligibility: "Girls from marginalized communities",
            link: "https://samagra.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "National Means cum Merit Scholarship",
            description: "Scholarship to prevent dropouts in Class 8 and encourage students to continue secondary education.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Students with < ₹3.5 lakh annual income",
            link: "https://dsel.education.gov.in/scheme/nmms",
            provider: "Department of Education"
        },
        {
            title: "Atal Tinkering Labs (ATL)",
            description: "Establishing labs in schools to foster curiosity, creativity and imagination in young minds and inculcate skills such as design mindset, computational thinking and physical computing.",
            category: "education",
            subCategory: "age",
            eligibility: "Schools and students from Class 6 to 12",
            link: "https://aim.gov.in/atal-tinkering-labs.php",
            provider: "NITI Aayog",
            isNew: true
        },
        {
            title: "NEAT 3.0 Portal",
            description: "National Educational Alliance for Technology - A public-private partnership model between the Government and Education Technology companies.",
            category: "education",
            subCategory: "higher",
            eligibility: "Students from marginalized sections and general students",
            link: "https://neat.aicte-india.org/",
            provider: "AICTE / Ministry of Education"
        },
        {
            title: "STARS Project",
            description: "Strengthening Teaching-Learning and Results for States. Aimed at improving the quality and governance of school education.",
            category: "education",
            subCategory: "age",
            eligibility: "Teachers and students in participating states",
            link: "https://stars.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "PM SHRI Schools",
            description: "Strengthening existing schools with modern facilities, green energy, and advanced teaching pedagogy.",
            category: "education",
            subCategory: "age",
            eligibility: "Government and local body schools",
            link: "https://pmshrischools.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "One Nation One Subscription",
            description: "Access to the world's best scientific research journals and publications through a single national license for Indian institutions.",
            category: "education",
            subCategory: "higher",
            eligibility: "All academic and research institutions",
            link: "https://www.education.gov.in/",
            provider: "Government of India"
        },
        {
            title: "Vidyanjali 2.0",
            description: "School Volunteer Management Program to connect schools with community and private sector volunteers.",
            category: "education",
            subCategory: "age",
            eligibility: "Citizens, professionals, NGOs, and Corporate sector",
            link: "https://vidyanjali.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "PRAGYATA Guidelines",
            description: "Digital education guidelines for schools to ensure quality online learning and student well-being.",
            category: "education",
            subCategory: "age",
            eligibility: "K-12 students and teachers",
            link: "https://pmevidya.education.gov.in/",
            provider: "NCERT"
        },
        {
            title: "NISHTHA Training",
            description: "National Initiative for School Heads' and Teachers' Holistic Advancement - world's largest teacher training program.",
            category: "education",
            subCategory: "age",
            eligibility: "Elementary school teachers and heads",
            link: "https://nishtha.ncert.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "DAE Graduate Fellowship",
            description: "Fellowship for graduates in science and engineering to pursue research in nuclear science and technology.",
            category: "education",
            subCategory: "research",
            eligibility: "B.Sc/B.Tech graduates with high scores",
            link: "https://www.dae.gov.in/",
            provider: "Department of Atomic Energy"
        },
        {
            title: "UP Post-Matric Scholarship",
            description: "Financial assistance for SC/ST/OBC/General students of Uttar Pradesh pursuing higher education.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "UP Domicile students, Income < ₹2.5 lakh",
            link: "https://scholarship.up.gov.in/",
            provider: "UP State Government"
        },
        {
            title: "MahaDBT (Post-Matric)",
            description: "Direct Benefit Transfer portal for various scholarships and fellowships for students in Maharashtra.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Maharashtra Domicile students",
            link: "https://mahadbt.maharashtra.gov.in/",
            provider: "Maharashtra State Government"
        },
        {
            title: "Bihar Post-Matric Scholarship",
            description: "Scholarship portal specifically for BC, EBC, SC and ST students of Bihar for post-matric studies.",
            category: "education",
            subCategory: "scholarship",
            eligibility: "Bihar Domicile students",
            link: "https://pmsonline.bih.nic.in/",
            provider: "Bihar State Government"
        },
        {
            title: "CSIR Research Fellowship",
            description: "Junior and Senior Research Fellowships for PhD students in science and technology fields.",
            category: "education",
            subCategory: "research",
            eligibility: "CSIR-NET qualified students",
            link: "https://csirhrdg.res.in/",
            provider: "CSIR"
        },
        {
            title: "ICMR JRF Fellowship",
            description: "Support for biomedical research enthusiasts to pursue PhD with financial assistance.",
            category: "education",
            subCategory: "research",
            eligibility: "ICMR-JRF exam qualifiers",
            link: "https://main.icmr.nic.in/content/junior-research-fellowship-jrf-0",
            provider: "Indian Council of Medical Research"
        },

        // --- HEALTHCARE ---
        {
            title: "Ayushman Bharat - PM-JAY",
            description: "World's largest health insurance scheme. Free treatment up to ₹5 lakh per family per year.",
            category: "healthcare",
            eligibility: "SECC 2011 identified families",
            link: "https://pmjay.gov.in/",
            provider: "National Health Authority"
        },
        {
            title: "PM Jan Aushadhi Pariyojana",
            description: "Providing quality generic medicines at affordable prices to all through special outlets.",
            category: "healthcare",
            eligibility: "All citizens (especially poor)",
            link: "https://janaushadhi.gov.in/",
            provider: "Department of Pharmaceuticals"
        },
        {
            title: "Janani Suraksha Yojana (JSY)",
            description: "Cash assistance for pregnant women for institutional delivery. Safe motherhood initiative.",
            category: "healthcare",
            eligibility: "Pregnant women from BPL/SC/ST families",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Pradhan Mantri Matru Vandana Yojana",
            description: "Maternity benefit program. Direct cash transfer of ₹5,000 in three installments.",
            category: "healthcare",
            eligibility: "Pregnant and lactating mothers",
            link: "https://pmmvy.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mission Indradhanush",
            description: "Universal immunization program. Full immunization for all children under 2 years.",
            category: "healthcare",
            eligibility: "Unvaccinated children and mothers",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Nikshay Poshan Yojana",
            description: "Financial incentive of ₹500 per month for nutritional support to TB patients.",
            category: "healthcare",
            eligibility: "All TB patients registered on NIKSHAY portal",
            link: "https://tbcindia.gov.in/",
            provider: "National TB Elimination Program"
        },
        {
            title: "e-Sanjeevani Teleconsultation",
            description: "Stay Home OPD. Telemedicine service providing free medical consultation online.",
            category: "healthcare",
            eligibility: "All Indian citizens",
            link: "https://esanjeevaniopd.in/",
            provider: "Ministry of Health & Family Welfare"
        },
        {
            title: "Rashtriya Bal Swasthya Karyakram",
            description: "Early identification and early intervention for 30 health conditions in children (4 Ds).",
            category: "healthcare",
            eligibility: "Children from birth to 18 years",
            link: "https://rbsk.nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "National Health Mission (NHM)",
            description: "Universal access to equitable, affordable and quality health care services.",
            category: "healthcare",
            eligibility: "General Public",
            link: "https://nhm.gov.in/",
            provider: "Government of India"
        },
        {
            title: "PM-Suraksha Bima Yojana",
            description: "Accidental insurance cover of ₹2 lakh at an ultra-low premium of ₹20 per year.",
            category: "healthcare",
            eligibility: "Bank account holders aged 18-70",
            link: "https://jansuraksha.gov.in/",
            provider: "Ministry of Finance"
        },
        {
            title: "PM National Dialysis Program",
            description: "Providing free dialysis services to the poor through Pradhan Mantri National Dialysis Programme (PMNDP) in Public Private Partnership (PPP) mode.",
            category: "healthcare",
            eligibility: "BPL patients (Free), Non-BPL (at discounted rates)",
            link: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1073&lid=636",
            provider: "Ministry of Health"
        },
        {
            title: "Rashtriya Arogya Nidhi (RAN)",
            description: "Financial assistance to patients living below the poverty line who are suffering from major life-threatening diseases to receive treatment at Government hospitals.",
            category: "healthcare",
            eligibility: "BPL family patients",
            link: "https://main.mohfw.gov.in/Major-Programmes/poor-patients-financial-assistance/rashtriya-arogya-nidhi",
            provider: "Ministry of Health & Family Welfare"
        },
        {
            title: "National Health Portal (NHP)",
            description: "Single point of access to authenticated health information for citizens, healthcare professionals and researchers.",
            category: "healthcare",
            eligibility: "All citizens",
            link: "https://www.nhp.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "PM-ABHIM",
            description: "PM Ayushman Bharat Health Infrastructure Mission. Strengthening and integrating health service delivery across all levels.",
            category: "healthcare",
            eligibility: "Public Healthcare Systems",
            link: "https://pmabhim.mohfw.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "National Tele Mental Health Programme",
            description: "Tele-MANAS provides free, round-the-clock mental health counseling and support services.",
            category: "healthcare",
            eligibility: "All citizens experiencing mental health issues",
            link: "https://telemanas.mohfw.gov.in/",
            provider: "Ministry of Health & Family Welfare"
        },
        {
            title: "ABDM (Digital Mission)",
            description: "Ayushman Bharat Digital Mission aims to develop a backbone for integrated digital health infrastructure.",
            category: "healthcare",
            eligibility: "Citizens, Doctors, Healthcare Facilities",
            link: "https://abdm.gov.in/",
            provider: "National Health Authority"
        },
        {
            title: "National Health Stack",
            description: "Digital health records and insurance processing framework for the entire country.",
            category: "healthcare",
            eligibility: "All healthcare stakeholders",
            link: "https://nha.gov.in/",
            provider: "NHA"
        },
        {
            title: "India TB Elimination Program",
            description: "Comprehensive care, diagnostic and nutritional support (Nikshay) for TB patients across India.",
            category: "healthcare",
            eligibility: "All TB patients in India",
            link: "https://tbcindia.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "National Leprosy Eradication",
            description: "Free diagnosis, multidrug therapy treatment and physical rehabilitation for leprosy patients.",
            category: "healthcare",
            eligibility: "Patients affected by Leprosy",
            link: "https://nlep.nic.in/",
            provider: "Directorate General of Health Services"
        },
        {
            title: "PM National Cancer Care Hub",
            description: "Specialized cancer daycare centers and treatment support at district levels.",
            category: "healthcare",
            eligibility: "All cancer patients",
            link: "https://main.mohfw.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "National Blindness Control",
            description: "Providing free cataract surgeries and distribution of spectacles to poor children.",
            category: "healthcare",
            eligibility: "Visually impaired citizens, especially BPL",
            link: "https://npcbvi.mohfw.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Surakshit Matritva Aashwasan (SUMAN)",
            description: "Dignified and quality healthcare for every woman and newborn visiting public health facilities at zero cost.",
            category: "healthcare",
            eligibility: "Pregnant women and newborns",
            link: "https://suman.nhm.gov.in/",
            provider: "Ministry of Health"
        },

        // --- AGRICULTURE ---
        {
            title: "PM-KISAN",
            description: "Direct income support of ₹6,000 per year to landholding farmers.",
            category: "agriculture",
            eligibility: "All landholding farmer families",
            link: "https://pmkisan.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "Kisan Credit Card (KCC)",
            description: "Short term credit for farmers to meet their financial requirements for cultivation.",
            category: "agriculture",
            eligibility: "Farmers, tenant farmers, sharecroppers",
            link: "https://pmkisan.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Fasal Bima Yojana",
            description: "Crop insurance scheme for farmers against non-preventable natural risks.",
            category: "agriculture",
            eligibility: "All farmers growing notified crops",
            link: "https://pmfby.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "e-NAM (National Agriculture Market)",
            description: "Online trading platform for agricultural commodities in India.",
            category: "agriculture",
            eligibility: "Farmers, traders, and local mandis",
            link: "https://www.enam.gov.in/",
            provider: "Small Farmers' Agribusiness Consortium"
        },
        {
            title: "PM-KUSUM",
            description: "Solar pumps and grid-connected solar power plants for farmers.",
            category: "agriculture",
            eligibility: "Individual farmers and Cooperatives",
            link: "https://pmkusum.mnre.gov.in/",
            provider: "Ministry of New & Renewable Energy"
        },
        {
            title: "Soil Health Card Scheme",
            description: "Customized crop-specific recommendations for fertilizer use to help farmers.",
            category: "agriculture",
            eligibility: "All farmers in India",
            link: "https://www.soilhealth.dac.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Krishi Sinchai Yojana",
            description: "Ensuring protective irrigation to all agricultural farms in the country.",
            category: "agriculture",
            eligibility: "States and individual landholders",
            link: "https://pmksy.gov.in/",
            provider: "Department of Agriculture"
        },
        {
            title: "Paramparagat Krishi Vikas Yojana",
            description: "Promotion of organic farming through a cluster-based approach.",
            category: "agriculture",
            eligibility: "Farmer groups (at least 50 farmers)",
            link: "https://pgsindia-ncof.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "National Bamboo Mission",
            description: "Support for bamboo plantation and making bamboo industries sustainable.",
            category: "agriculture",
            eligibility: "Farmers and Entrepreneurs",
            link: "https://nbm.nic.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Matsya Sampada Yojana",
            description: "Development of fisheries sector with financial support for fishers.",
            category: "agriculture",
            eligibility: "Fishers and Fish farmers",
            link: "https://pmmsy.dof.gov.in/",
            provider: "Department of Fisheries"
        },
        {
            title: "National Food Security Mission",
            description: "Increasing production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.",
            category: "agriculture",
            eligibility: "Farmers across various states",
            link: "https://www.nfsm.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "Pradhan Mantri Annadata Aay Sanraksan Abhiyan (PM-AASHA)",
            description: "Ensuring remunerative prices to the farmers for their produce as announced in the Union Budget.",
            category: "agriculture",
            eligibility: "Farmers producing Oilseeds, Pulses and Copra",
            link: "https://pib.gov.in/PressNoteDetails.aspx?NoteId=151590",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Dhan-Dhaanya Yojana",
            description: "Umbrella scheme for crop diversification, productivity enhancement and modernization of irrigation in 100 districts.",
            category: "agriculture",
            eligibility: "Farmers in 100 selected districts",
            link: "https://agricoop.nic.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "Digital Public Infra (Agri)",
            description: "Digital crop survey and JanSamarth-based Kisan Credit Cards for modern farm financing.",
            category: "agriculture",
            eligibility: "Kisan Credit Card holders",
            link: "https://pmkisan.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM-PRANAM Scheme",
            description: "Promotion of Alternate Nutrients for Agriculture Management to reduce chemical fertilizer usage.",
            category: "agriculture",
            eligibility: "State Governments and Farmer Groups",
            link: "https://www.fert.nic.in/",
            provider: "Ministry of Chemicals & Fertilizers"
        },
        {
            title: "GOBARdhan Scheme",
            description: "Galvanizing Organic Bio-Agro Resources Dhan for managing cattle waste and producing bio-gas.",
            category: "agriculture",
            eligibility: "Rural households and cooperatives",
            link: "https://sbm.gov.in/gobardhan/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "Krishi Udan 2.0",
            description: "Assistance in transporting agricultural products by air to hilly, tribal and remote areas.",
            category: "agriculture",
            eligibility: "Agri-exporters and Farmer groups",
            link: "https://www.civilaviation.gov.in/",
            provider: "Ministry of Civil Aviation"
        },
        {
            title: "Micro Irrigation Fund",
            description: "Dedicated fund with NABARD to promote water efficiency through drip and sprinkler irrigation.",
            category: "agriculture",
            eligibility: "States and Community groups",
            link: "https://www.nabard.org/",
            provider: "NABARD"
        },
        {
            title: "PM-Promotion of Makhana",
            description: "Specific mission for Bihar's makhana farmers to improve cultivation and marketing.",
            category: "agriculture",
            eligibility: "Makhana growers in North Bihar",
            link: "https://state.bihar.gov.in/krishi/",
            provider: "Bihar State Govt"
        },
        {
            title: "National Bee & Honey Mission",
            description: "Support for 'Sweet Revolution' through scientific beekeeping and honey production.",
            category: "agriculture",
            eligibility: "Beekeepers and Farmer Cooperatives",
            link: "https://nbhm.gov.in/",
            provider: "National Bee Board"
        },
        {
            title: "MISHTI (Mangrove Mission)",
            description: "Mangrove Initiative for Shoreline Habitats & Tangible Incomes through coastal plantation.",
            category: "agriculture",
            eligibility: "Coastal communities",
            link: "https://moef.gov.in/",
            provider: "Ministry of Environment"
        },
        {
            title: "Amrit Dharohar",
            description: "Promoting conservation and sustainable use of Ramsar wetlands in India.",
            category: "agriculture",
            eligibility: "Wetland dependent communities",
            link: "https://moef.gov.in/",
            provider: "Ministry of Environment"
        },

        // --- EMPLOYMENT & BUSINESS ---
        {
            title: "Viksit Bharat Rozgar Mission (VB-GRAM G)",
            description: "Providing 125 days of guaranteed wage employment to rural households. Replaces the former MGNREGA scheme with enhanced livelihood support.",
            category: "jobs",
            eligibility: "Adult members of rural households",
            link: "https://nrega.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "SANKALP Program",
            description: "Skill Acquisition and Knowledge Awareness for Livelihood Promotion. Strengthening institutional mechanisms for skill development.",
            category: "jobs",
            eligibility: "Youth and Skill Training Providers",
            link: "https://msde.gov.in/",
            provider: "Ministry of Skill Development"
        },
        {
            title: "STRIVE Project",
            description: "Skills Strengthening for Industrial Value Enhancement. Aiming for improved performance of ITIs and apprenticeship training.",
            category: "jobs",
            eligibility: "ITI students and industries",
            link: "https://dgt.gov.in/STRIVE",
            provider: "DGT / MSDE"
        },
        {
            title: "PM-Kushal Program",
            description: "Employment linked skill training specialized for future-ready vocations like drones and AI.",
            category: "jobs",
            eligibility: "Unemployed youth aged 18-35",
            link: "https://www.skillindia.gov.in/",
            provider: "MSDE"
        },
        {
            title: "National Career Service (NCS) 2.0",
            description: "Enhanced job matching portal with integrated career counseling and skill training modules.",
            category: "jobs",
            eligibility: "All job seekers and employers",
            link: "https://www.ncs.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "State Employment Exchanges",
            description: "Local platforms for registering for government jobs and state-specific employment assistance.",
            category: "jobs",
            eligibility: "Domicile of respective states",
            link: "https://www.india.gov.in/topics/labour-employment/employment-exchange",
            provider: "State Governments"
        },
        {
            title: "Rozgar Mela Portal",
            description: "Platform for organizing and tracking government job appointment letters distribution.",
            category: "jobs",
            eligibility: "Government job aspirants",
            link: "https://www.upsc.gov.in/",
            provider: "Government of India"
        },
        {
            title: "NAPS 2.0 (Apprenticeship)",
            description: "Improved National Apprenticeship Promotion Scheme with direct stipend transfer to candidates.",
            category: "jobs",
            eligibility: "Graduates, Diplomas, and ITI holders",
            link: "https://www.apprenticeshipindia.gov.in/",
            provider: "MSDE"
        },
        {
            title: "PM-SURAJ Portal",
            description: "Social Utthan and Rozgar Adharit Jankalyan. Credit support for marginalized sections like Safai Karamcharis.",
            category: "jobs",
            eligibility: "Scheduled Castes and Safai Karamcharis",
            link: "https://pmsuraj.dosje.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "PM Mudra Yojana",
            description: "Loans up to ₹10 lakh for small business activities in non-farm sectors.",
            category: "jobs",
            eligibility: "Micro-enterprises and Retailers",
            link: "https://www.mudra.org.in/",
            provider: "MUDRA Ltd"
        },
        {
            title: "Start Up India",
            description: "Recognition and support for new startups including tax exemptions.",
            category: "jobs",
            eligibility: "New innovative businesses in India",
            link: "https://www.startupindia.gov.in/",
            provider: "DPIIT"
        },
        {
            title: "Stand Up India",
            description: "Loans targeted at SC/ST and Women entrepreneurs for greenfield projects.",
            category: "jobs",
            eligibility: "SC/ST and Women above 18 years",
            link: "https://www.standupmitra.in/",
            provider: "SIDBI"
        },
        {
            title: "PM-EGP (Employment Generation)",
            description: "Credit linked subsidy program for setting up small enterprises.",
            category: "jobs",
            eligibility: "Individuals above 18, self-help groups",
            link: "https://www.kviconline.gov.in/pmegpeportal/",
            provider: "KVIC"
        },
        {
            title: "National Career Service",
            description: "Job seeker registration, career counseling, and job matching services.",
            category: "jobs",
            eligibility: "All unemployed youth",
            link: "https://www.ncs.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "e-Shram Portal",
            description: "Database of unorganized workers to provide social security benefits.",
            category: "jobs",
            eligibility: "Unorganized workers aged 16-59",
            link: "https://eshram.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "Lakhpati Didi",
            description: "Skilling women in SHGs to earn at least ₹1 lakh annually.",
            category: "jobs",
            eligibility: "Women in SHGs",
            link: "https://nrlm.gov.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "PM SVANidhi",
            description: "Micro-credit for street vendors up to ₹10,000 for working capital.",
            category: "jobs",
            eligibility: "Street vendors in urban areas",
            link: "https://pmsvanidhi.mohua.gov.in/",
            provider: "Ministry of Housing & Urban Affairs"
        },
        {
            title: "Skill India Mission",
            description: "Empowering youth with industrial/vocational skill training.",
            category: "jobs",
            eligibility: "School/College dropouts and youth",
            link: "https://www.skillindia.gov.in/",
            provider: "MSDE"
        },
        {
            title: "PM-DAKSH Scheme",
            description: "Skill development training for marginalized groups including SCs, OBCs, and Safai Karamcharis. Free training with stipend support.",
            category: "jobs",
            eligibility: "SCs, OBCs, EWS, and Safai Karamcharis aged 18-45",
            link: "https://pmdaksh.dosje.gov.in/",
            provider: "Ministry of Social Justice & Empowerment"
        },
        {
            title: "PM Vishwakarma Scheme",
            description: "End-to-end support for traditional artisans and craftspeople. Includes toolkit incentives of ₹15,000 and collateral-free loans.",
            category: "jobs",
            eligibility: "Traditional artisans (Carpenters, Potters, Smiths, etc.)",
            link: "https://pmvishwakarma.gov.in/",
            provider: "Ministry of MSME"
        },

        // --- HOUSING & INFRA ---
        {
            title: "PMAY-Urban",
            description: "Affordable housing for urban poor with interest subsidies.",
            category: "housing",
            eligibility: "Economically Weaker Sections (EWS)",
            link: "https://pmay-urban.gov.in/",
            provider: "Ministry of Housing"
        },
        {
            title: "PMAY-Gramin",
            description: "Housing assistance for rural households without a pucca house.",
            category: "housing",
            eligibility: "Rural families in SECC list",
            link: "https://pmayg.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "Jal Jeevan Mission",
            description: "Providing functional tap connection to every rural household (Har Ghar Jal).",
            category: "housing",
            eligibility: "Rural households",
            link: "https://jaljeevanmission.gov.in/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "PM-Saubhagya",
            description: "Ensuring last mile connectivity and electricity connections to all un-electrified households.",
            category: "housing",
            eligibility: "Rural and Urban poor households",
            link: "https://saubhagya.gov.in/",
            provider: "Ministry of Power"
        },
        {
            title: "Solar Rooftop Subsidy",
            description: "Incentives for installing solar panels on rooftops for households.",
            category: "housing",
            eligibility: "Residential consumers",
            link: "https://solarrooftop.gov.in/",
            provider: "Ministry of New & Renewable Energy"
        },
        {
            title: "Swachh Bharat Mission (Gramin)",
            description: "Making rural India Open Defecation Free (ODF) and ensuring door to door waste collection and treatment.",
            category: "housing",
            eligibility: "Rural households",
            link: "https://swachhbharatmission.gov.in/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "AMRUT 2.0",
            description: "Atal Mission for Rejuvenation and Urban Transformation aimed at providing universal coverage of water supply through functional taps to all households.",
            category: "housing",
            eligibility: "Urban households in 4700+ ULBs",
            link: "https://amrut.gov.in/",
            provider: "Ministry of Housing & Urban Affairs"
        },

        // --- SOCIAL WELFARE / OTHER ---
        {
            title: "Atal Pension Yojana",
            description: "Pension scheme for unorganized sector workers with guaranteed income.",
            category: "schemes",
            eligibility: "Citizens aged 18-40",
            link: "https://npscra.nsdl.co.in/",
            provider: "PFRDA"
        },
        {
            title: "Sukanya Samriddhi Yojana",
            description: "Small deposit scheme for the girl child with high interest rate.",
            category: "schemes",
            eligibility: "Girl child aged < 10 years",
            link: "https://www.indiapost.gov.in/",
            provider: "Department of Posts"
        },
        {
            title: "One Nation One Ration Card",
            description: "Portability of food security benefits across the country.",
            category: "schemes",
            eligibility: "Ration card holders (NFSA)",
            link: "https://nfsa.gov.in/",
            provider: "Ministry of Consumer Affairs"
        },
        {
            title: "PM-GKAY (Garib Kalyan Anna)",
            description: "Free food grains to all NFSA beneficiaries. World's largest food security program.",
            category: "schemes",
            eligibility: "All Ration card holders",
            link: "https://nfsa.gov.in/",
            provider: "Ministry of Food"
        },
        {
            title: "E-Shram National Card",
            description: "Universal Account Number (UAN) for unorganized workers for social security portability.",
            category: "schemes",
            eligibility: "Workers in the unorganized sector",
            link: "https://eshram.gov.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "PM Shram Yogi Maandhan",
            description: "Pension scheme for unorganized workers with a monthly pension of ₹3,000.",
            category: "schemes",
            eligibility: "Unorganized workers, Income < ₹15,000",
            link: "https://maandhan.in/",
            provider: "Ministry of Labour & LIC"
        },
        {
            title: "PM Kisan Maandhan",
            description: "Pension scheme for small and marginal farmers to ensure social security in old age.",
            category: "schemes",
            eligibility: "Farmers aged 18-40 years",
            link: "https://maandhan.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM Laghu Vyapari Maandhan",
            description: "Pension scheme for retail traders, shopkeepers and self-employed persons.",
            category: "schemes",
            eligibility: "Shopkeepers with annual turnover < ₹1.5 Cr",
            link: "https://maandhan.in/",
            provider: "Ministry of Labour"
        },
        {
            title: "Ujjwala 2.0",
            description: "LPG connections for women from BPL families without deposit.",
            category: "schemes",
            eligibility: "Adult women of BPL households",
            link: "https://www.pmuy.gov.in/",
            provider: "Ministry of Petroleum"
        },
        {
            title: "PM Jan Dhan Yojana",
            description: "Universal access to banking facilities with zero balance account.",
            category: "schemes",
            eligibility: "All unbanked citizens",
            link: "https://pmjdy.gov.in/",
            provider: "Department of Financial Services"
        },
        {
            title: "Beti Bachao Beti Padhao",
            description: "Preventing gender-biased sex selection and ensuring girl's education.",
            category: "schemes",
            eligibility: "General Public",
            link: "https://wcd.nic.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "PM Vishwakarma",
            description: "End-to-end support for traditional artisans and craftspeople.",
            category: "jobs",
            eligibility: "Traditional artisans (Sculptors, Potter, etc.)",
            link: "https://pmvishwakarma.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "PM-JANMAN",
            description: "Justice for Janjati Adivasi through comprehensive development.",
            category: "schemes",
            eligibility: "Particularly Vulnerable Tribal Groups (PVTGs)",
            link: "https://tribal.nic.in/",
            provider: "Ministry of Tribal Affairs"
        },
        {
            title: "SVAMITVA Scheme",
            description: "Providing property validation and 'Record of Rights' to village household owners through drone surveys.",
            category: "schemes",
            eligibility: "Rural property owners",
            link: "https://svamitva.nic.in/",
            provider: "Ministry of Panchayati Raj"
        },
        {
            title: "PRASAD Scheme",
            description: "Pilgrimage Rejuvenation and Spiritual Augmentation Drive for holistic development of identified pilgrimage destinations.",
            category: "schemes",
            eligibility: "Tourism stakeholders and pilgrims",
            link: "https://tourism.gov.in/",
            provider: "Ministry of Tourism"
        },
        {
            title: "Swadesh Darshan",
            description: "Integrated development of theme-based tourist circuits in the country.",
            category: "schemes",
            eligibility: "Tourism sector and public",
            link: "https://swadeshdarshan.gov.in/",
            provider: "Ministry of Tourism"
        },
        {
            title: "PM-Vikas",
            description: "Vishwakarma Kaushal Samman providing skilling and marketing support for traditional artisans.",
            category: "jobs",
            eligibility: "Traditional artisans and craftspeople",
            link: "https://pmvishwakarma.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "Mission Vatsalya",
            description: "The primary scheme for child protection and child welfare services in India.",
            category: "schemes",
            eligibility: "Children in need of care and protection",
            link: "https://wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "National Creche Scheme",
            description: "Providing a safe and stimulating environment for children (6 months to 6 years) of working mothers.",
            category: "schemes",
            eligibility: "Children of working mothers",
            link: "https://wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "LADLI Scheme (States)",
            description: "Financial incentive for the education and marriage of girls from poor families in multiple Indian states.",
            category: "schemes",
            eligibility: "Girl children from low-income families",
            link: "https://www.india.gov.in/",
            provider: "State Governments"
        },
        {
            title: "Mukhyamantri Ladli Behna",
            description: "Monthly financial assistance for women in states like MP and others to promote self-reliance.",
            category: "schemes",
            eligibility: "Married women of low-income families",
            link: "https://cmladlibehna.mp.gov.in/",
            provider: "State Governments"
        },
        {
            title: "Vividha Portal",
            description: "Centralized portal for women artisans to list and sell their handcrafted products.",
            category: "women",
            eligibility: "Women artisans and SHGs",
            link: "https://wcd.gov.in/",
            provider: "Ministry of Women"
        },
        {
            title: "Nari Shakti Hub",
            description: "One-stop digital resource for women's laws, rights, and empowerment schemes.",
            category: "women",
            eligibility: "All women in India",
            link: "https://wcd.gov.in/",
            provider: "Government of India"
        },
        {
            title: "Kanya Sumangala Yojana",
            description: "Conditional cash transfer to promote girl's health and education in Uttar Pradesh.",
            category: "women",
            eligibility: "Girl children in UP",
            link: "https://mksy.up.gov.in/",
            provider: "UP State Govt"
        },
        {
            title: "Majhi Konya Bhagyashree",
            description: "Assistance to the girl child and mother in Maharashtra to prevent female infanticide.",
            category: "women",
            eligibility: "Girl children in Maharashtra",
            link: "https://maharashtra.gov.in/",
            provider: "Maharashtra State Govt"
        },
        {
            title: "PM-Awas Gramin (States)",
            description: "State-specific top-up subsidies and monitoring for rural housing projects.",
            category: "housing",
            eligibility: "Rural BPL households",
            link: "https://pmayg.nic.in/",
            provider: "States & Central Govt"
        },
        {
            title: "Affordable Rental Housing (ARHCs)",
            description: "Rental housing for urban migrants and poor near their workplace.",
            category: "housing",
            eligibility: "Urban migrants and industrial workers",
            link: "https://arhc.mohua.gov.in/",
            provider: "Ministry of Housing"
        },
        {
            title: "GRIHA Portal",
            description: "Green Rating for Integrated Habitat Assessment - standards for sustainable housing in India.",
            category: "housing",
            eligibility: "Builders, Architects and Home owners",
            link: "https://www.grihaindia.org/",
            provider: "MNRE & TERI"
        },
        {
            title: "RERA Portals",
            description: "Real Estate Regulatory Authority links for every state to protect home-buyer interests.",
            category: "housing",
            eligibility: "Real estate buyers and developers",
            link: "https://www.india.gov.in/topics/housing/rera",
            provider: "State RERA Authorities"
        },
        {
            title: "Bhuunaksha Portal",
            description: "Digitized cadastral maps for checking land records and boundaries across Indian states.",
            category: "agriculture",
            eligibility: "Land owners and farmers",
            link: "https://pib.gov.in/",
            provider: "NIC / State Govts"
        },
        {
            title: "Rainfed Area Development (RAD)",
            description: "Component of NMSA focusing on Integrated Farming System (IFS) for enhancing productivity in rainfed areas.",
            category: "agriculture",
            eligibility: "Farmers in rainfed regions",
            link: "https://nmsa.dac.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "Sub-Mission on Agroforestry (SMAF)",
            description: "Encouraging farmers to plant multi-purpose trees on their farmlands along with agricultural crops.",
            category: "agriculture",
            eligibility: "Landholding farmers",
            link: "https://nmsa.dac.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "National Project on Organic Farming",
            description: "Promoting organic inputs and bio-fertilizers for sustainable agriculture through financial assistance.",
            category: "agriculture",
            eligibility: "Bio-fertilizer units and Organic farmers",
            link: "https://ncof.dac.gov.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "SMILE Scheme",
            description: "Support for marginalized individuals for Livelihood and Enterprise.",
            category: "schemes",
            eligibility: "Transgender persons and people engaged in begging",
            link: "https://socialjustice.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "PM-DAKSH",
            description: "Skill development for marginalized sections to make them employable.",
            category: "jobs",
            eligibility: "SC, OBC, EBC and Safai Karamcharis",
            link: "https://pmdaksh.dosje.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "PM-VAYO SHREE",
            description: "Providing physical aids and assisted-living devices for senior citizens belonging to BPL category.",
            category: "schemes",
            eligibility: "Senior citizens (60+) under BPL category",
            link: "https://socialjustice.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "SHRESHTA Scheme",
            description: "Residential education for SC students in high schools in targeted areas. Quality education for meritorious students.",
            category: "schemes",
            eligibility: "Meritorious SC students",
            link: "https://shreshta.nsfdc.nic.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "NAMASTE Scheme",
            description: "National Action for Mechanised Sanitation Ecosystem to ensure safety and dignity of sanitation workers.",
            category: "schemes",
            eligibility: "Sanitation workers and municipalities",
            link: "https://namaste.dosje.gov.in/",
            provider: "Ministry of Social Justice / Housing"
        },
        {
            title: "APY (Pension) Portal",
            description: "Official portal for tracking your Atal Pension Yojana contributions and status.",
            category: "schemes",
            eligibility: "All APY subscribers",
            link: "https://npscra.nsdl.co.in/scheme-details.php",
            provider: "PFRDA"
        },
        {
            title: "National Social Assistance (NSAP)",
            description: "Pension for elderly, widows and disabled individuals from BPL households.",
            category: "schemes",
            eligibility: "BPL elderly, Windows, and PwDs",
            link: "https://nsap.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "PM-DevINE",
            description: "Prime Minister’s Development Initiative for North East Region to fund infrastructure and social projects.",
            category: "schemes",
            eligibility: "Projects in North Eastern States",
            link: "https://mdoner.gov.in/",
            provider: "Ministry of Development of North Eastern Region"
        },
        {
            title: "Sansad Adarsh Gram Yojana",
            description: "Development of model villages through community participation and convergence of schemes.",
            category: "schemes",
            eligibility: "Rural Panchayats",
            link: "https://saanjhi.gov.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "Antyodaya Anna Yojana",
            description: "Providing highly subsidized food grains to the poorest of the poor families.",
            category: "schemes",
            eligibility: "Poorest of poor families (AAY card holders)",
            link: "https://nfsa.gov.in/",
            provider: "Department of Food & Public Distribution"
        },

        // --- WOMEN & CHILD ---
        {
            title: "Pradhan Mantri Matru Vandana Yojana",
            description: "Maternity benefit program providing cash incentives for pregnant and lactating mothers.",
            category: "women",
            eligibility: "Pregnant and lactating mothers",
            link: "https://pmmvy.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mahila Coir Yojana",
            description: "Skill development program for women artisans in the coir industry with 75% subsidy on machinery and training support.",
            category: "women",
            eligibility: "Rural women artisans who completed training",
            link: "https://coirboard.gov.in/schemes-financial-assistance.php",
            provider: "Coir Board"
        },
        {
            title: "STEP Scheme",
            description: "Support to Training and Employment Programme for Women to provide skills that lead to employability.",
            category: "women",
            eligibility: "Women aged 16 years and above",
            link: "https://wcd.gov.in/schemes/support-training-and-employment-programme-women-step",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Mission Shakti (Mahila Shakti Kendra)",
            description: "Empowering rural women through community participation, skill development, employment, and providing convergence of government schemes. Includes Sambal (safety) and Samarthya (empowerment) sub-schemes.",
            category: "women",
            eligibility: "Rural women across India",
            link: "https://missionshakti.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "One Stop Centre Scheme",
            description: "Integrated support for women affected by violence including medical aid, legal assistance, temporary shelter, police support, and psycho-social counseling.",
            category: "women",
            eligibility: "All women facing violence",
            link: "https://missionshakti.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Nari Shakti Puraskar",
            description: "Highest civilian honor for women in India, recognizing exceptional achievements and contributions.",
            category: "women",
            eligibility: "Women and institutions working for women's empowerment",
            link: "https://narishaktipuraskar.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Sakhi Niwas (Working Women Hostel)",
            description: "Providing safe and affordable accommodation for working women with daycare facilities for their children in urban, semi-urban and rural areas.",
            category: "women",
            eligibility: "Working women, trainees under training for job",
            link: "https://missionshakti.wcd.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "Poshan Abhiyaan",
            description: "Prime Minister’s Overarching Scheme for Holistic Nourishment, aimed at reducing malnutrition and stunted growth in children.",
            category: "women",
            eligibility: "Children (0-6 years), Pregnant and Lactating Mothers",
            link: "https://poshanabhiyaan.gov.in/",
            provider: "Ministry of Women & Child Development"
        },
        {
            title: "SABLA Scheme",
            description: "Rajiv Gandhi Scheme for Empowerment of Adolescent Girls to provide them with life skills and vocational training.",
            category: "women",
            eligibility: "Adolescent girls (11-18 years)",
            link: "https://wcd.gov.in/schemes/rgseag-sabla",
            provider: "Ministry of Women & Child Development"
        },

        // --- DISABILITY SUPPORT ---
        {
            title: "ADIP Scheme",
            description: "Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances (ADIP). Apply through ARJUN portal for assistive devices.",
            category: "disability",
            eligibility: "Persons with 40% or more disability, monthly income < ₹30,000",
            link: "https://adip.depwd.gov.in/",
            provider: "Department of Empowerment of Persons with Disabilities"
        },
        {
            title: "National Fellowship for Students with Disabilities",
            description: "Fellowship for students with disabilities to pursue M.Phil and Ph.D. programs.",
            category: "disability",
            eligibility: "Students with disabilities pursuing higher education",
            link: "https://scholarships.gov.in/",
            provider: "UGC / Ministry of Social Justice"
        },
        {
            title: "Deendayal Disabled Rehabilitation Scheme",
            description: "Financial assistance to NGOs for providing education, vocational training and rehabilitation of persons with disabilities. Apply through e-Anudaan portal.",
            category: "disability",
            eligibility: "NGOs and PwD beneficiaries",
            link: "https://depwd.gov.in/",
            provider: "Ministry of Social Justice"
        },
        {
            title: "Unique Disability ID (UDID)",
            description: "Creation of a national database for PwDs and providing a unique ID card for accessing government benefits.",
            category: "disability",
            eligibility: "All persons with disabilities",
            link: "https://www.swavlambancard.gov.in/",
            provider: "DEPwD"
        },
        {
            title: "Sugamya Bharat Abhiyan",
            description: "Accessible India Campaign to make the built environment, transport system, and ICT ecosystem accessible for PwDs.",
            category: "disability",
            eligibility: "All citizens (infrastructure focus)",
            link: "https://accessibleindia.gov.in/",
            provider: "Government of India"
        },
        {
            title: "NHFDC Loan Schemes",
            description: "Concessional loans for persons with disabilities for starting small businesses or professional education.",
            category: "disability",
            eligibility: "Persons with disabilities aged 18-60",
            link: "https://www.nhfdc.org/",
            provider: "National Handicapped Finance and Development Corp"
        },
        {
            title: "Sugamya Pustakalaya",
            description: "An online library where books are available in accessible formats for people with visual impairment or other print disabilities.",
            category: "disability",
            eligibility: "Persons with print disabilities",
            link: "https://library.daisyindia.org/",
            provider: "Ministry of Electronics & IT"
        },

        // --- STARTUPS & BUSINESS ---
        {
            title: "Startup India Seed Fund Scheme",
            description: "Financial assistance to startups for proof of concept, prototype development, product trials, and market entry.",
            category: "startup",
            eligibility: "Startups recognized by DPIIT",
            link: "https://seedfund.startupindia.gov.in/",
            provider: "Department for Promotion of Industry and Internal Trade"
        },
        {
            title: "MAARG Portal",
            description: "Mentorship, Advisory, Assistance, Resilience and Growth - platform for connects startups with mentors.",
            category: "startup",
            eligibility: "All startups and entrepreneurs",
            link: "https://maarg.startupindia.gov.in/",
            provider: "DPIIT"
        },
        {
            title: "TIDE 2.0 (MeitY)",
            description: "Technology Incubation and Development of Entrepreneurs. Support for tech startups using ICT, AI, etc.",
            category: "startup",
            eligibility: "Tech startups in selected centers",
            link: "https://www.meitystartuphub.in/",
            provider: "Ministry of Electronics & IT"
        },
        {
            title: "SAMRIDH Scheme",
            description: "MeitY's Startup Accelerator of MeitY for Product Innovation, Development, and Growth.",
            category: "startup",
            eligibility: "Early stage software startups",
            link: "https://www.meitystartuphub.in/samridh",
            provider: "MeitY Startup Hub"
        },
        {
            title: "GENESIS Program",
            description: "Gen-next Support for Innovative Startups by MeitY for deep-tech entrepreneurs.",
            category: "startup",
            eligibility: "Deep-tech startups in Tier 2/3 cities",
            link: "https://www.meity.gov.in/",
            provider: "MeitY"
        },
        {
            title: "ASPIRE Scheme",
            description: "A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship.",
            category: "startup",
            eligibility: "MSMEs and Rural Entrepreneurs",
            link: "https://aspire.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "PMEGP (KVIC)",
            description: "Credit-linked subsidy program for setting up new micro-enterprises in non-farm sector.",
            category: "startup",
            eligibility: "Individuals above 18 years",
            link: "https://www.kviconline.gov.in/",
            provider: "KVIC / MSME"
        },
        {
            title: "National Startup Awards",
            description: "Recognizing and rewarding outstanding startups that exhibit high potential for employment and wealth creation.",
            category: "startup",
            eligibility: "DPIIT Recognized Startups",
            link: "https://www.startupindia.gov.in/awards",
            provider: "Government of India"
        },
        {
            title: "Karnataka Startup Cell",
            description: "Hub for various grants, incubation and funding for startups in Karnataka.",
            category: "startup",
            eligibility: "Karnataka based startups",
            link: "https://startup.karnataka.gov.in/",
            provider: "Karnataka State Govt"
        },
        {
            title: "iStart Rajasthan",
            description: "Flagship initiative for fostering innovation and startups in the state of Rajasthan.",
            category: "startup",
            eligibility: "Rajasthan based startups",
            link: "https://istart.rajasthan.gov.in/",
            provider: "Rajasthan State Govt"
        },
        {
            title: "Startup Odisha Portal",
            description: "Single window system for startups in Odisha to access incentives and mentorship.",
            category: "startup",
            eligibility: "Odisha based startups",
            link: "https://startupodisha.gov.in/",
            provider: "Odisha State Govt"
        },
        {
            title: "Innovation Mission Punjab",
            description: "Promoting innovation and culture of entrepreneurship across the state of Punjab.",
            category: "startup",
            eligibility: "Punjab based startups",
            link: "https://impunjab.org/",
            provider: "Punjab State Govt"
        },
        {
            title: "Tamil Nadu Startup Mission",
            description: "Support system for entrepreneurs in Tamil Nadu with grant and equity investments.",
            category: "startup",
            eligibility: "TAMIL NADU based startups",
            link: "https://startuptn.in/",
            provider: "TANSIM"
        },
        {
            title: "Kerala Startup Mission",
            description: "Nodal agency for the entrepreneurship development and startup activities in Kerala.",
            category: "startup",
            eligibility: "Kerala based startups",
            link: "https://startupmission.kerala.gov.in/",
            provider: "KSUM"
        },
        {
            title: "Atal Community Innovation Centres",
            description: "Nurturing community-focused innovation and startup ecosystem in underserved regions.",
            category: "startup",
            eligibility: "Universities, Institutions, Private sector",
            link: "https://aim.gov.in/acic.php",
            provider: "NITI Aayog"
        },
        {
            title: "MSME Idea Hackathon",
            description: "Platform for supporting and funding innovative ideas from students and entrepreneurs.",
            category: "startup",
            eligibility: "Students, MSMEs and Individuals",
            link: "https://innovate.mygov.in/msme-idea-hackathon/",
            provider: "Ministry of MSME"
        },
        {
            title: "National Digital Library",
            description: "A virtual repository of learning resources with a single-window search facility for researchers and students.",
            category: "education",
            subCategory: "research",
            eligibility: "All learners and researchers",
            link: "https://ndl.iitkgp.ac.in/",
            provider: "IIT Kharagpur / Ministry of Education"
        },
        {
            title: "Shodhganga",
            description: "Reservoir of Indian theses and dissertations submitted to various universities in India.",
            category: "education",
            subCategory: "research",
            eligibility: "Research scholars and academics",
            link: "https://shodhganga.inflibnet.ac.in/",
            provider: "INFLIBNET Centre"
        },
        {
            title: "National Museum Portal",
            description: "Digital access to the collections of various national museums across India.",
            category: "education",
            subCategory: "higher",
            eligibility: "All citizens and researchers",
            link: "https://museumsofindia.gov.in/",
            provider: "Ministry of Culture"
        },
        {
            title: "E-PG Pathshala",
            description: "Curriculum-based, interactive e-content in 70 subjects across all disciplines of social sciences, arts, fine arts and humanities.",
            category: "education",
            subCategory: "higher",
            eligibility: "Post-graduate students",
            link: "https://epgp.inflibnet.ac.in/",
            provider: "UGC"
        },
        {
            title: "Bhasha Abhiyaan",
            description: "Promotion and preservation of various Indian languages through digital resource creation.",
            category: "education",
            subCategory: "higher",
            eligibility: "Language learners and researchers",
            link: "https://www.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "E-Amrit Portal",
            description: "One-stop destination for all information on electric vehicles in India - policies, subsidies, and insurance.",
            category: "schemes",
            eligibility: "Prospective EV buyers and owners",
            link: "https://e-amrit.niti.gov.in/",
            provider: "NITI Aayog"
        },
        {
            title: "FAME-II Subsidy",
            description: "Faster Adoption and Manufacturing of Electric Vehicles - subsidy portal for EVs.",
            category: "schemes",
            eligibility: "EV buyers (2-wheelers, 3-wheelers, etc.)",
            link: "https://fame2.heavyindustries.gov.in/",
            provider: "Dept of Heavy Industry"
        },
        {
            title: "PM-EBus Sewa",
            description: "Initiative to augment city bus operations by deployment of 10,000 electric buses on PPP model.",
            category: "schemes",
            eligibility: "Urban commuters and municipalities",
            link: "https://mohua.gov.in/",
            provider: "Ministry of Housing & Urban Affairs"
        },
        {
            title: "ASPIRE Scheme",
            description: "A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship.",
            category: "startup",
            eligibility: "Entrepreneurs and MSMEs",
            link: "https://aspire.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "SFURTI Scheme",
            description: "Scheme of Fund for Regeneration of Traditional Industries for making traditional industries more productive and competitive.",
            category: "startup",
            eligibility: "Traditional industry clusters, NGOs, SHGs",
            link: "https://sfurti.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "CLCS-TU Scheme",
            description: "Credit Linked Capital Subsidy and Technology Upgradation Scheme for MSMEs.",
            category: "startup",
            eligibility: "Micro and Small Enterprises",
            link: "https://msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "ZED Certification Scheme",
            description: "Zero Defect Zero Effect (ZED) Certification for MSMEs to encourage quality and environmental sustainability.",
            category: "startup",
            eligibility: "MSMEs with valid Udyam Registration",
            link: "https://zed.msme.gov.in/",
            provider: "Ministry of MSME"
        },
        {
            title: "SAMRIDH Scheme",
            description: "Startup Accelerator of MeitY for Product Innovation, Development and growth. Financial aid up to ₹40 lakh for software startups.",
            category: "startup",
            eligibility: "Startups and Accelerators",
            link: "https://www.meity.gov.in/startups",
            provider: "Ministry of Electronics & IT"
        },
        {
            title: "Mudra Loan Program",
            description: "Refinance support to banks for lending to micro-units in manufacturing, trading, and service sectors.",
            category: "startup",
            eligibility: "Small businesses and entrepreneurs",
            link: "https://www.mudra.org.in/",
            provider: "MUDRA Bank"
        },
        {
            title: "TIDE 2.0 Scheme",
            description: "Technology Incubation and Development of Entrepreneurs aimed at promoting tech startups through 51 TIDE centers across India. Support for IoT, AI, blockchain startups.",
            category: "startup",
            eligibility: "Tech Entrepreneurs and Startups",
            link: "https://www.meity.gov.in/startups",
            provider: "MeitY"
        },
        {
            title: "MSME Champion Portal",
            description: "A unified portal for MSMEs to resolve grievances, seek guidance and access multiple schemes under one umbrella.",
            category: "startup",
            eligibility: "All MSMEs and Entrepreneurs",
            link: "https://champions.gov.in/",
            provider: "Ministry of MSME"
        },

        // --- ADDITIONAL RESOURCES ---
        {
            title: "Digital India BPO Promotion Scheme",
            description: "Incentives to BPO/ITES operations in small towns and cities to create employment.",
            category: "jobs",
            eligibility: "IT/ITES companies",
            link: "https://meity.gov.in/ibps",
            provider: "MeitY"
        },
        {
            title: "PLI for Electronics",
            description: "Production Linked Incentive scheme for large scale electronics manufacturing in India including mobile phones, IT hardware, and electronic components.",
            category: "startup",
            eligibility: "Manufacturing companies",
            link: "https://www.meity.gov.in/esdm/pli",
            provider: "Ministry of Electronics & IT"
        },
        {
            title: "RKVY-RAFTAAR",
            description: "Rashtriya Krishi Vikas Yojana - Remunerative Approaches for Agriculture and Allied Sectors Rejuvenation.",
            category: "agriculture",
            eligibility: "States and Farmer Groups",
            link: "https://rkvy.nic.in/",
            provider: "Ministry of Agriculture"
        },
        {
            title: "PM-ABHIM",
            description: "PM Ayushman Bharat Health Infrastructure Mission for strengthening health systems across levels.",
            category: "healthcare",
            eligibility: "General Public / Health Institutions",
            link: "https://nhm.gov.in/",
            provider: "Ministry of Health"
        },
        {
            title: "Ayushman Bhava",
            description: "Campaign to ensure optimum delivery of health schemes to every intended beneficiary.",
            category: "healthcare",
            eligibility: "All citizens",
            link: "https://ayushmanbhava.mohfw.gov.in/",
            provider: "National Health Authority"
        },
        {
            title: "SVAMITVA Scheme",
            description: "Survey of Villages and Mapping with Improvised Technology in Village Areas for property validation.",
            category: "schemes",
            eligibility: "Rural property owners",
            link: "https://svamitva.nic.in/",
            provider: "Ministry of Panchayati Raj"
        },
        {
            title: "PM-PRANAM",
            description: "PM Programme for Restoration, Awareness, Nourishment and Amelioration of Mother Earth (Reduction of Chemical Fertilizers).",
            category: "agriculture",
            eligibility: "Farmers and State Governments",
            link: "https://fert.nic.in/",
            provider: "Ministry of Chemicals & Fertilizers"
        },
        {
            title: "Namami Gange",
            description: "Integrated Conservation Mission to check pollution, conservation and rejuvenation of National River Ganga.",
            category: "schemes",
            eligibility: "General Public / Communities along Ganga",
            link: "https://nmcg.nic.in/",
            provider: "National Mission for Clean Ganga"
        },
        {
            title: "PM Van Dhan Yojana",
            description: "Livelihood generation for tribals by harnessing non-timber forest produce.",
            category: "jobs",
            eligibility: "Tribal gatherers and SHGs",
            link: "https://trifed.tribal.gov.in/",
            provider: "TRIFED"
        },
        {
            title: "National Digital Health Mission",
            description: "Digital health ecosystem for India, including ABHA (Health ID) and digital health records.",
            category: "healthcare",
            eligibility: "All Indian citizens",
            link: "https://abdm.gov.in/",
            provider: "NHA"
        },
        {
            title: "E-Shram Card",
            description: "Registration of unorganized workers to facilitate social security benefits and accidental insurance cover.",
            category: "schemes",
            eligibility: "Unorganized workers aged 16-59",
            link: "https://eshram.gov.in/",
            provider: "Ministry of Labour & Employment"
        },
        {
            title: "PM SHRI Schools",
            description: "PM Schools for Rising India - upgraded schools with modern infrastructure and pedagogical techniques.",
            category: "education",
            eligibility: "Students in government schools",
            link: "https://pmshrischools.education.gov.in/",
            provider: "Ministry of Education"
        },
        {
            title: "National Apprenticeship Promotion Scheme",
            description: "Incentivizing employers to engage apprentices and providing training for youth.",
            category: "jobs",
            eligibility: "Apprentices and Training Providers",
            link: "https://www.apprenticeshipindia.gov.in/",
            provider: "MSDE"
        },
        {
            title: "Operation Greens",
            description: "Integrated development of Tomato, Onion and Potato (TOP) value chain to prevent price volatility.",
            category: "agriculture",
            eligibility: "Farmers and Food Processors",
            link: "https://mofpi.gov.in/",
            provider: "Ministry of Food Processing"
        },
        {
            title: "PM DevINE",
            description: "Prime Minister’s Development Initiative for North East Region to fund infrastructure and social development projects.",
            category: "schemes",
            eligibility: "NE Region projects and communities",
            link: "https://mdoner.gov.in/",
            provider: "MDoNER"
        },
        {
            title: "Mahila Samman Saving Certificate",
            description: "Small savings scheme for women with attractive interest rates and partial withdrawal options.",
            category: "women",
            eligibility: "Women and Girl Child",
            link: "https://www.indiapost.gov.in/Financial/Pages/Content/MSSC.aspx",
            provider: "Department of Posts"
        },
        {
            title: "MISHTI Scheme",
            description: "Mangrove Initiative for Shoreline Habitats & Tangible Incomes for mangrove plantation along coastline.",
            category: "schemes",
            eligibility: "Coastal communities and environmental agencies",
            link: "https://moef.gov.in/en/resource/mangrove-initiative-for-shoreline-habitats-tangible-incomes-mishti/",
            provider: "Ministry of Environment & Forests"
        },
        {
            title: "Amrit Bharat Station Scheme",
            description: "Modernization of railway stations across the country with enhanced passenger amenities.",
            category: "housing",
            eligibility: "Rail passengers",
            link: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,533,2693",
            provider: "Ministry of Railways"
        },
        {
            title: "PM-Jivan Jyoti Bima Yojana",
            description: "Life insurance cover of ₹2 lakh for savings bank account holders for an annual premium of ₹436.",
            category: "schemes",
            eligibility: "Bank account holders aged 18-50",
            link: "https://jansuraksha.gov.in/",
            provider: "Ministry of Finance"
        },
        {
            title: "NSAP (Social Assistance)",
            description: "Financial assistance to the elderly, widows and persons with disabilities in the form of social pensions.",
            category: "schemes",
            eligibility: "BPL households, senior citizens, widows",
            link: "https://nsap.nic.in/",
            provider: "Ministry of Rural Development"
        },
        {
            title: "Atal Bhujal Yojana",
            description: "Sustainable management of ground water resources with community participation.",
            category: "agriculture",
            eligibility: "Gram Panchayats in identified regions",
            link: "https://ataljal.mowr.gov.in/",
            provider: "Ministry of Jal Shakti"
        },
        {
            title: "National Logistics Policy",
            description: "Reducing cost of logistics and improving efficiency for global competitiveness through Unified Logistics Interface Platform (ULIP) and digital integration.",
            category: "startup",
            eligibility: "Logistics companies and entrepreneurs",
            link: "https://www.goulip.in/",
            provider: "DPIIT"
        }
    ]


    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true)
                const response = await api.get('/resources')
                const dbResources = response.data || []

                // Combine hardcoded with DB resources, avoiding duplicates by title
                const combined = [...governmentResources]
                dbResources.forEach(dbR => {
                    if (!combined.find(h => h.title === dbR.title)) {
                        combined.unshift(dbR)
                    }
                })

                setResources(combined)
            } catch (error) {
                console.error('Error fetching resources:', error)
                setResources(governmentResources)
            } finally {
                setLoading(false)
            }
        }
        fetchResources()
        fetchResources()
    }, [])

    // Log search queries (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                api.post('/tracking/log/search', {
                    query: searchQuery,
                    context: 'resources'
                }).catch(err => console.error(err))
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        filterResources()
    }, [searchQuery, selectedCategory, selectedSubCategory, resources])

    const filterResources = () => {
        let filtered = resources

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(r => r.category === selectedCategory)

            // Sub-category filter for Education
            if (selectedCategory === 'education' && selectedSubCategory !== 'all') {
                filtered = filtered.filter(r => r.subCategory === selectedSubCategory)
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.provider.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredResources(filtered)
    }

    // Show only 4 resources initially, then all on "View More"
    const displayedResources = showAll ? filteredResources : filteredResources.slice(0, 4)

    return (
        <div className="resources-page">
            <div className="container">
                <div className="page-header">
                    <h1>Government Resources & Schemes</h1>
                    <p>Access official government schemes, programs, and resources for your benefit</p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{resources.length}+</div>
                            <div className="stat-label">Active Schemes</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Search size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">10</div>
                            <div className="stat-label">Categories</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Award size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Official Sources</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="search-filter-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search schemes, programs, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category.value}
                                className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category.value)
                                    setSelectedSubCategory('all')
                                    setShowAll(false)
                                }}
                            >
                                {category.icon}
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {selectedCategory === 'education' && (
                        <div className="education-sub-filters fade-in">
                            {subCategories.map(sub => (
                                <button
                                    key={sub.value}
                                    className={`sub-filter-btn ${selectedSubCategory === sub.value ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedSubCategory(sub.value)
                                        setShowAll(false)
                                    }}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resources Grid */}
                <div className="resources-grid">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading government resources...</p>
                        </div>
                    ) : displayedResources.length > 0 ? (
                        displayedResources.map((resource, index) => (
                            <div key={index} className="resource-card">
                                <div className="resource-header">
                                    <span className={`badge badge-${resource.category === 'schemes' ? 'primary' :
                                        resource.category === 'education' ? 'info' :
                                            resource.category === 'healthcare' ? 'error' :
                                                resource.category === 'housing' ? 'warning' :
                                                    resource.category === 'agriculture' ? 'success' :
                                                        resource.category === 'women' ? 'primary' :
                                                            resource.category === 'disability' ? 'info' :
                                                                resource.category === 'startup' ? 'success' :
                                                                    'secondary'
                                        }`}>
                                        {resource.category}
                                    </span>
                                    {resource.isNew && <span className="badge badge-error">New</span>}
                                </div>

                                <h3>{resource.title}</h3>
                                <p className="resource-description">{resource.description}</p>

                                <div className="resource-meta">
                                    <div className="meta-item">
                                        <strong>Provider:</strong> {resource.provider}
                                    </div>
                                    {resource.eligibility && (
                                        <div className="meta-item">
                                            <strong>Eligibility:</strong> {resource.eligibility}
                                        </div>
                                    )}
                                </div>

                                <div className="resource-actions">
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => trackResourceView(resource)}
                                    >
                                        Visit Official Website
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Filter size={48} />
                            <p>No resources found matching your criteria</p>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory('all')
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* View More Button */}
                {filteredResources.length > 4 && (
                    <div className="view-more-section">
                        <button
                            className="view-more-btn"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : `View More (${filteredResources.length - 4} more)`}
                        </button>
                    </div>
                )}

                {/* Important Links Section */}
                <div className="important-links-section">
                    <h2>Important Government Portals</h2>
                    <div className="links-grid">
                        <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Building size={24} />
                            <h4>India.gov.in</h4>
                            <p>National Portal of India</p>
                        </a>
                        <a href="https://www.mygov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Users size={24} />
                            <h4>MyGov</h4>
                            <p>Citizen Engagement Platform</p>
                        </a>
                        <a href="https://www.digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <GraduationCap size={24} />
                            <h4>Digital India</h4>
                            <p>Digital Empowerment</p>
                        </a>
                        <a href="https://www.umang.gov.in/" target="_blank" rel="noopener noreferrer" className="link-card">
                            <Briefcase size={24} />
                            <h4>UMANG</h4>
                            <p>Unified Mobile App</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Resources
