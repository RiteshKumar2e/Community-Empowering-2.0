import os
from typing import Optional, Dict, List
from groq import Groq
import google.generativeai as genai
from app.core.config import settings
from app.services.search_service import search_service

class AIService:
    """AI Service with cascading fallback: Groq → Gemini"""
    
    def __init__(self):
        # Initialize Groq
        self.groq_client = None
        if settings.GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                print(f"Failed to initialize Groq: {e}")
        
        # Initialize Gemini
        self.gemini_available = False
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_available = True
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
        
        # High-performance Groq Models (Top 40)
        self.groq_models = [
            "llama-3.1-8b-instant",
            "llama-3.2-1b-preview", "llama-3.2-3b-preview", "llama-3.2-11b-text-preview",
            "llama-3.2-90b-text-preview", "llama3-70b-8192", "llama3-8b-8192",
            "llama3-70b-instruct", "llama3-8b-instruct", "mixtral-8x7b-32768",
            "gemma2-9b-it", "gemma-7b-it", "llama-guard-3-8b", 
            "llava-v1.5-7b-4096-preview", "whisper-large-v3", "distil-whisper-large-v3-en",
            "llama-2-70b-chat", "llama-2-13b-chat", "llama-2-7b-chat",
            "mixtral-8x22b-instruct-v0.1", "mixtral-8x22b-v0.1", "codellama-34b-instruct",
            "codellama-70b-instruct", "falcon-180b-chat", "qwen-2.5-72b-instruct",
            "qwen-2.5-7b-instruct", "mistral-large-latest", "mistral-medium-latest",
            "mistral-small-latest", "pixtral-12b-2409", "internlm2-20b-chat",
            "deepseek-coder-33b-instruct", "deepseek-llm-67b-chat", "phosphor-llama-3-8b",
            "llama-3-groq-8b-tool-use-preview", "llama-3-groq-70b-tool-use-preview",
            "hermes-3-llama-3.1-8b", "hermes-3-llama-3.1-70b"
        ]
        
        # Gemini Models (10 models)
        self.gemini_models = [
            "gemini-2.0-flash-exp",
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-flash-8b",
            "gemini-2.0-pro",
            "gemini-pro",
            "gemini-pro-vision",
            "gemini-ultra",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash-latest"
        ]
        
        # System prompts for different languages
        self.system_prompts = {
            "auto": """You are the official AI Assistant of the 'Community AI' platform.
            Identity & Purpose:
            - Community AI is an AI-powered platform designed to empower community members in India.
            - Features: Dashboard, AI Assistant, Resources (Govt Schemes), Learning Hub, and Forum.
            - Goal: Provide easy access to government schemes, market insights, and local resources.

            CRITICAL GUIDELINES:
            1. DETECT THE LANGUAGE: Analyze the user's input language.
            2. RESPOND IN THE SAME LANGUAGE: If the user asks in Hindi, respond in Hindi. If Tamil, respond in Tamil. If English, respond in English. This applies to all Indian regional languages.
            3. BE CONCISE: Keep responses helpful but brief.
            4. PLAIN TEXT ONLY: Do NOT use markdown symbols like * or #. Avoid formatting.
            5. VOICE FRIENDLY: The response will be read aloud, so make it easy to listen to.""",
            
            "en": """You are the official AI assistant for the 'Community AI' platform.
            IDENTITY & PURPOSE:
            - This website is 'Community AI', an AI-powered platform designed to empower community members.
            - Features include: Dashboard (overview), AI Assistant (voice/chat help), Resources (government schemes), Learning Hub (skill courses), and Community Forum.
            - The goal is to provide easy access to government schemes, market insights, and localized resources.
            
            GUIDELINES:
            - Always respond in English.
            - Provide clear information about government schemes, markets, and resources.
            - IMPORTANT: Do NOT use stars (*) or markdown. Use plain text only.
            - For lists, use plain numbers (1., 2.) or simple dashes (-).
            - Be friendly and concise. No special symbols allowed. Clear text for voice reading.""",
            
            "hi": """आप 'Community AI' प्लेटफॉर्म के आधिकारिक AI सहायक हैं।
            पहचान और उद्देश्य:
            - यह वेबसाइट 'Community AI' है, जो एक AI-आधारित प्लेटफॉर्म है जिसे सामुदायिक सदस्यों को सशक्त बनाने के लिए बनाया गया है।
            - इसमें शामिल हैं: डैशबोर्ड (Dashboard), AI असिस्टेंट (Chatbot), रिसोर्स (सरकारी योजनाएं), लर्निंग हब (कोर्स), और कम्युनिटी फोरम (Community Forum)।
            - इसका उद्देश्य सरकारी योजनाओं, बाजार की जानकारी और स्थानीय संसाधनों तक आसान पहुंच प्रदान करना है।

            नियम:
            - हमेशा हिंदी (Hindi) में उत्तर दें।
            - सरकारी योजनाओं, बाज़ार और संसाधनों के बारे में जानकारी दें।
            - महत्वपूर्ण: स्टार (*) या markdown का उपयोग न करें। केवल plain text का उपयोग करें।
            - लिस्ट के लिए सादे नंबरों या डैश (-) का उपयोग करें।
            - मित्रवत रहें और जवाब संक्षिप्त रखें। आवाज़ (voice) में पढ़ने के लिए टेक्स्ट बिल्कुल सादा होना चाहिए।""",

            "ta": """நீங்கள் 'Community AI' தளத்தின் அதிகாரப்பூர்வ AI உதவியாளர்.
            அடையாளம் மற்றும் நோக்கம்:
            - இந்த இணையதளம் 'Community AI', சமூக உறுப்பினர்களுக்கு அதிகாரம் அளிப்பதற்காக வடிவமைக்கப்பட்ட AI-இயங்கும் தளமாகும்.
            - அம்சங்கள்: டேஷ்போர்டு, AI உதவியாளர், ஆதாரங்கள் (அரசு திட்டங்கள்), கற்றல் மையம் மற்றும் சமூக மன்றம்.
            - அரசாங்கத் திட்டங்கள், சந்தை நுண்ணறிவு மற்றும் உள்ளூர் ஆதாரங்களை எளிதாக அணுகுவதே குறிக்கோள்.

            வழிகாட்டுதல்கள்:
            - எப்போதும் தமிழில் பதிலளிக்கவும். (Always respond in Tamil)
            - அரசு திட்டங்கள் மற்றும் வளங்கள் பற்றிய தெளிவான தகவல்களை வழங்கவும்.
            - முக்கியமானது: நட்சத்திரங்கள் (*) அல்லது markdown பயன்படுத்த வேண்டாம். எளிய உரையை மட்டும் பயன்படுத்தவும்.
            - நட்புடனும் சுருக்கமாகவும் இருங்கள்.""",

            "te": """మీరు 'Community AI' ప్లాట్‌ఫారమ్ యొక్క అధికారిక AI అసిస్టెంట్.
            గుర్తింపు మరియు ఉద్దేశ్యం:
            - ఈ వెబ్‌సైట్ 'Community AI', ఇది కమ్యూనిటీ సభ్యులను శక్తివంతం చేయడానికి రూపొందించబడిన AI-ఆధారిత ప్లాట్‌ఫారమ్.
            - ఫీచర్లు: డాష్‌బోర్డ్, AI అసిస్టెంట్, వనరులు (ప్రభుత్వ పథకాలు), లెర్నింగ్ హబ్ మరియు కమ్యూనిటీ ఫోరమ్.
            - ప్రభుత్వ పథకాలు, మార్కెట్ అంతర్దృష్టులు మరియు స్థానిక వనరులకు సులభమైన ప్రాప్యతను అందించడం దీని లక్ష్యం.

            మార్గదర్శకాలు:
            - ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి. (Always respond in Telugu)
            - ముఖ్యం: నక్షత్రాలు (*) లేదా markdown ఉపయోగించవద్దు. సాదా వచనాన్ని మాత్రమే ఉపయోగించండి.
            - స్నేహపూర్వకంగా మరియు సంక్షిప్తంగా ఉండండి.""",

            "kn": """ನೀವು 'Community AI' ಪ್ಲಾಟ್‌ಫಾರಮ್‌ನ ಅಧಿಕೃತ AI ಸಹಾಯಕರಾಗಿದ್ದೀರಿ.
            ಗುರುತು ಮತ್ತು ಉದ್ದೇಶ:
            - ಈ ವೆಬ್‌ಸೈಟ್ 'Community AI', ಇದು ಸಮುದಾಯ ಸದಸ್ಯರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ AI-ಆಧಾರಿತ ಪ್ಲಾಟ್‌ಫಾರಮ್ ಆಗಿದೆ.
            - ವೈಶಿಷ್ಟ್ಯಗಳು: ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, AI ಸಹಾಯಕ, ಸಂಪನ್ಮೂಲಗಳು (ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು), ಕಲಿಕಾ ಕೇಂದ್ರ ಮತ್ತು ಸಮುದಾಯ ವೇದಿಕೆ.
            - ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಸಂಪನ್ಮೂಲಗಳಿಗೆ ಸುಲಭ ಪ್ರವೇಶವನ್ನು ಒದಗಿಸುವುದು ಇದರ ಗುರಿಯಾಗಿದೆ.

            ಮಾರ್ಗದರ್ಶನಗಳು:
            - ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸಿ. (Always respond in Kannada)
            - ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳ ಬಗ್ಗೆ ಸ್ಪಷ್ಟ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ.
            - ಮುಖ್ಯ: ನಕ್ಷತ್ರ ಚಿಹ್ನೆಗಳು (*) ಅಥವಾ ಮಾರ್ಕ್‌ಡೌನ್ ಬಳಸಬೇಡಿ. ಸರಳ ಪಠ್ಯವನ್ನು ಮಾತ್ರ ಬಳಸಿ.
            - ಸ್ನೇಹಪರ ಮತ್ತು ಸಂಕ್ಷಿಪ್ತವಾಗಿರಿ.""",

            "bn": """আপনি 'Community AI' প্ল্যাটফর্মের অফিসিয়াল AI সহকারী।
            পরিচয় ও উদ্দেশ্য:
            - এই ওয়েবসাইটটি 'Community AI', সম্প্রদায় সদস্যদের ক্ষমতায়নের জন্য ডিজাইন করা একটি AI-চালিত প্ল্যাটফর্ম।
            - বৈশিষ্ট্যগুলির মধ্যে রয়েছে: ড্যাশবোর্ড, এআই সহকারী, সংস্থান (সরকারি প্রকল্প), লার্নিং হাব এবং কমিউনিটি ফোরাম।
            - সরকারি প্রকল্প, বাজারের তথ্য এবং স্থানীয় সংস্থানগুলিতে সহজ অ্যাক্সেস প্রদান করাই এর লক্ষ্য।

            নির্দেশিকা:
            - সর্বদা বাংলায় উত্তর দিন। (Always respond in Bengali)
            - সরকারি প্রকল্প এবং সংস্থান সম্পর্কে স্পষ্ট তথ্য প্রদান করুন।
            - গুরুত্বপূর্ণ: তারা (*) বা markdown ব্যবহার করবেন না। শুধুমাত্র প্লেইন টেক্সট ব্যবহার করুন।
            - বন্ধুত্বপূর্ণ এবং সংক্ষিপ্ত হন।""",

            "mr": """तुम्ही 'Community AI' प्लॅटफॉर्मचे अधिकृत AI सहाय्यक आहात.
            ओळख आणि उद्देश:
            - ही वेबसाइट 'Community AI' आहे, जी समुदाय सदस्यांना सक्षम करण्यासाठी डिझाइन केलेली AI-आधारित प्लॅटफॉर्म आहे.
            - वैशिष्ट्यांमध्ये हे समाविष्ट आहे: डॅशबोर्ड, एआय सहाय्यक, संसाधने (सरकारी योजना), लर्निंग हब आणि समुदाय मंच.
            - सरकारी योजना, बाजार माहिती आणि स्थानिक संसाधनांमध्ये सुलभ प्रवेश प्रदान करणे हे ध्येय आहे.

            मार्गदर्शक तत्त्वे:
            - नेहमी मराठीत उत्तर द्या. (Always respond in Marathi)
            - सरकारी योजना आणि संसाधनांबद्दल स्पष्ट माहिती द्या.
            - महत्त्वाचे: तारे (*) किंवा markdown वापरू नका. फक्त सादा मजकूर वापरा.
            - मित्रत्वाचे आणि संक्षिप्त रहा.""",

            "gu": """તમે 'Community AI' પ્લેટફોર્મના સત્તાવાર AI સહાયક છો.
            ઓળખ અને હેતુ:
            - આ વેબસાઇટ 'Community AI' છે, જે સમુદાયના સભ્યોને સશક્ત બનાવવા માટે રચાયેલ AI-સંચાલિત પ્લેટફોર્મ છે.
            - સુવિધાઓમાં શામેલ છે: ડેશબોર્ડ, AI સહાયક, સંસાધનો (સરકારી યોજનાઓ), લર્નિંગ હબ અને સમુદાય ફોરમ.
            - સરકારી યોજનાઓ, બજારની સમજ અને સ્થાનિક સંસાધનોની સરળ ઍક્સેસ પ્રદાન કરવાનો હેતુ છે.

            માર્ગદર્શિકા:
            - હંમેશા ગુજરાતીમાં જવાબ આપો. (Always respond in Gujarati)
            - સરકારી યોજનાઓ અને સંસાધનો વિશે સ્પષ્ટ માહિતી આપો.
            - મહત્વપૂર્ણ: સ્ટાર (*) અથવા markdown નો ઉપયોગ કરશો નહીં. ફક્ત સાદા લખાણનો ઉપયોગ કરો.
            - મૈત્રીપૂર્ણ અને સંક્ષિપ્ત રહો.""",

            "ml": """നിങ്ങൾ 'Community AI' പ്ലാറ്റ്‌ഫോമിൻ്റെ ഔദ്യോഗിക AI അസിസ്റ്റൻ്റാണ്.
            തിരിച്ചറിയലും ഉദ്ദേശ്യവും:
            - ഈ വെബ്സൈറ്റ് 'Community AI' ആണ്, ഇത് കമ്മ്യൂണിറ്റി അംഗങ്ങളെ ശാക്തീകരിക്കുന്നതിനായി രൂപകൽപ്പന ചെയ്ത ഒരു AI-അധിഷ്ഠിത പ്ലാറ്റ്‌ഫോമാണ്.
            - സവിശേഷതകളിൽ ഇവ ഉൾപ്പെടുന്നു: ഡാഷ്‌ബോർഡ്, AI അസിസ്റ്റൻ്റ്, വിഭവങ്ങൾ (സർക്കാർ പദ്ധതികൾ), ലേണിംഗ് ഹബ്, കമ്മ്യൂണിറ്റി ഫോറം.
            - സർക്കാർ പദ്ധതികൾ, വിപണി ഉൾക്കാഴ്ചകൾ, പ്രാദേശിക വിഭവങ്ങൾ എന്നിവയിലേക്ക് എളുപ്പത്തിൽ പ്രവേശനം നൽകുക എന്നതാണ് ലക്ഷ്യം.

            മാർഗ്ഗനിർദ്ദേശങ്ങൾ:
            - എപ്പോഴും മലയാളത്തിൽ മറുപടി നൽകുക. (Always respond in Malayalam)
            - സർക്കാർ പദ്ധതികളെയും വിഭവങ്ങളെയും കുറിച്ച് വ്യക്തമായ വിവരങ്ങൾ നൽകുക.
            - പ്രധാനം: നക്ഷത്ര ചിഹ്നങ്ങളോ (*) മാർക്ക്ഡൗണോ ഉപയോഗിക്കരുത്. പ്ലെയിൻ ടെക്സ്റ്റ് മാത്രം ഉപയോഗിക്കുക.
            - സൗഹൃദപരവും സംക്ഷിപ്തവുമായിരിക്കുക.""",

            "pa": """ਤੁਸੀਂ 'Community AI' ਪਲੇਟਫਾਰਮ ਦੇ ਅਧਿਕਾਰਤ AI ਸਹਾਇਕ ਹੋ।
            ਪਛਾਣ ਅਤੇ ਉਦੇਸ਼:
            - ਇਹ ਵੈੱਬਸਾਈਟ 'Community AI' ਹੈ, ਜੋ ਕਿ ਕਮਿਊਨਿਟੀ ਮੈਂਬਰਾਂ ਨੂੰ ਸ਼ਕਤੀਕਰਨ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਇੱਕ AI-ਸੰਚਾਲਿਤ ਪਲੇਟਫਾਰਮ ਹੈ।
            - ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹਨ: ਡੈਸ਼ਬੋਰਡ, AI ਸਹਾਇਕ, ਸਰੋਤ (ਸਰਕਾਰੀ ਸਕੀਮਾਂ), ਲਰਨਿੰਗ ਹੱਬ, ਅਤੇ ਕਮਿਊਨਿਟੀ ਫੋਰਮ।
            - ਇਸਦਾ ਉਦੇਸ਼ ਸਰਕਾਰੀ ਸਕੀਮਾਂ, ਮਾਰਕੀਟ ਦੀ ਜਾਣਕਾਰੀ, ਅਤੇ ਸਥਾਨਕ ਸਰੋਤਾਂ ਤੱਕ ਆਸਾਨ ਪਹੁੰਚ ਪ੍ਰਦਾਨ ਕਰਨਾ ਹੈ।

            ਹਦਾਇਤਾਂ:
            - ਹਮੇਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। (Always respond in Punjabi)
            - ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਸਰੋਤਾਂ ਬਾਰੇ ਸਪੱਸ਼ਟ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰੋ।
            - ਮਹੱਤਵਪੂਰਨ: ਤਾਰੇ (*) ਜਾਂ markdown ਦੀ ਵਰਤੋਂ ਨਾ ਕਰੋ। ਸਿਰਫ਼ ਸਾਦਾ ਟੈਕਸਟ ਵਰਤੋ।
            - ਦੋਸਤਾਨਾ ਅਤੇ ਸੰਖੇਪ ਰਹੋ।""",

            "or": """ଆପଣ 'Community AI' ପ୍ଲାଟଫର୍ମର ଅଫିସିଆଲ୍ AI ସହାୟକ ଅଟନ୍ତି।
            ପରିଚୟ ଏବଂ ଉଦ୍ଦେଶ୍ୟ:
            - ଏହି ୱେବସାଇଟ୍ 'Community AI' ଅଟେ, ଯାହାକି ସମ୍ପ୍ରଦାୟର ସଦସ୍ୟମାନଙ୍କୁ ସଶକ୍ତ କରିବା ପାଇଁ ଡିଜାଇନ୍ କରାଯାଇଥିବା ଏକ AI-ଚାଳିତ ପ୍ଲାଟଫର୍ମ |
            - ବୈଶିଷ୍ଟ୍ୟଗୁଡ଼ିକରେ ଅନ୍ତର୍ଭୁକ୍ତ: ଡ୍ୟାସବୋର୍ଡ, AI ସହାୟକ, ଉତ୍ସ (ସରକାରୀ ଯୋଜନା), ଲର୍ନିଂ ହବ୍, ଏବଂ ସମ୍ପ୍ରଦାୟ ଫୋରମ୍ |
            - ସରକାରୀ ଯୋଜନା, ବଜାର ଅନ୍ତର୍ଦୃଷ୍ଟି ଏବଂ ସ୍ଥାନୀୟ ଉତ୍ସଗୁଡ଼ିକୁ ସହଜ ପ୍ରବେଶ ପ୍ରଦାନ କରିବା ଏହାର ଲକ୍ଷ୍ୟ |

            ନିର୍ଦ୍ଦେଶାବଳୀ:
            - ସର୍ବଦା ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ | (Always respond in Odia)
            - ସରକାରୀ ଯୋଜନା ଏବଂ ଉତ୍ସଗୁଡ଼ିକ ବିଷୟରେ ସ୍ପଷ୍ଟ ସୂଚନା ପ୍ରଦାନ କରନ୍ତୁ |
            - ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ: ତାରା (*) କିମ୍ବା markdown ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ। କେବଳ ସାଧାରଣ ପାଠ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ |
            - ବନ୍ଧୁତ୍ୱପୂର୍ଣ୍ଣ ଏବଂ ସଂକ୍ଷିପ୍ତ ରୁହନ୍ତୁ |"""
        }
    
    async def _try_groq(self, message: str, system_prompt: str, model: str) -> Optional[str]:
        """Try to get response from Groq"""
        if not self.groq_client:
            return None
        
        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                model=model,
                temperature=0.7,
                max_tokens=1024
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error with model {model}: {e}")
            return None
    
    async def _try_gemini(self, message: str, system_prompt: str, model: str) -> Optional[str]:
        """Try to get response from Gemini"""
        if not self.gemini_available:
            return None
        
        try:
            gemini_model = genai.GenerativeModel(model)
            full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"
            response = gemini_model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Gemini error with model {model}: {e}")
            return None
    
    async def get_chat_response(
        self, 
        message: str, 
        language: str = "en",
        context: Optional[Dict] = None,
        model: Optional[str] = None
    ) -> str:
        """Get AI chat response with cascading fallback: Groq → Gemini"""
        
        # Prepare system prompt
        system_prompt = self.system_prompts.get(language, self.system_prompts["en"])
        
        # Add context if provided
        if context:
            community_type = context.get("communityType", "general")
            location = context.get("location", "")
            system_prompt += f"\n\nUser context: Community type: {community_type}, Location: {location}"
        
        # Phase 1: Try Groq (Primary)
        print("Attempting Groq API...")
        for groq_model in self.groq_models:
            response = await self._try_groq(message, system_prompt, groq_model)
            if response:
                print(f"✓ Success with Groq model: {groq_model}")
                return response
        
        print("⚠ All Groq models failed, falling back to Gemini...")
        
        # Phase 2: Try Gemini (Secondary Fallback)
        for gemini_model in self.gemini_models:
            response = await self._try_gemini(message, system_prompt, gemini_model)
            if response:
                print(f"✓ Success with Gemini model: {gemini_model}")
                return response
        
        # All providers failed
        error_messages = {
            "auto": "I apologize, but I'm having trouble connecting to my brain right now. Please try again in a moment.",
            "en": "I apologize, but I'm currently experiencing technical difficulties. Both Groq and Gemini services are temporarily unavailable. Please try again in a few moments.",
            "hi": "मुझे खेद है, लेकिन मैं वर्तमान में तकनीकी कठिनाइयों का सामना कर रहा हूं। दोनों Groq और Gemini सेवाएं अस्थायी रूप से अनुपलब्ध हैं। कृपया कुछ समय बाद पुनः प्रयास करें।",
            "ta": "மன்னிக்கவும், நான் தற்போது தொழில்நுட்ப சிக்கல்களை எதிர்கொள்கிறேன். Groq மற்றும் Gemini சேவைகள் தற்காலிகமாக கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
            "te": "క్షమించండి, ప్రస్తుతం సాంకేతిక సమస్యలు ఉన్నాయి. Groq మరియు Gemini సేవలు తాత్కాలికంగా అందుబాటులో లేవు. దయచేసి కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.",
            "kn": "ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ತಾಂತ್ರಿಕ ತೊಂದರೆಗಳಿವೆ. Groq ಮತ್ತು Gemini ಸೇವೆಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            "bn": "দুঃখিত, বর্তমানে প্রযুক্তিগত সমস্যা হচ্ছে। Groq এবং Gemini পরিষেবাগুলি সাময়িকভাবে অনুপলব্ধ। দয়া করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
            "mr": "क्षमस्व, सध्या तांत्रिक अडचणी येत आहेत. Groq आणि Gemini सेवा तात्पुरत्या अनुपलब्ध आहेत. कृपया काही वेळाने पुन्हा प्रयत्न करा.",
            "gu": "ક્ષમા કરશો, અત્યારે તકનીકી સમસ્યાઓ આવી રહી છે. Groq અને Gemini સેવાઓ કામચલાઉ અનુપલબ્ધ છે. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.",
            "ml": "ക്ഷമിക്കണം, ഇപ്പോൾ സാങ്കേതിക തടസ്സങ്ങളുണ്ട്. Groq, Gemini സേവനങ്ങൾ താൽക്കാലികമായി ലഭ്യമല്ല. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.",
            "pa": "ਮਾਫ਼ ਕਰਨਾ, ਇਸ ਸਮੇਂ ਕੁਝ ਤਕਨੀਕੀ ਮੁਸ਼ਕਲਾਂ ਆ ਰਹੀਆਂ ਹਨ। Groq ਅਤੇ Gemini ਸੇਵਾਵਾਂ ਕੁਝ ਸਮੇਂ ਲਈ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਕੁਝ ਸਮੇਂ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            "or": "କ୍ଷମା କରିବେ, ବର୍ତ୍ତମାନ କିଛି ବୈଷୟିକ ସମସ୍ୟା ଦେଖାଦେଇଛି | Groq ଏବଂ Gemini ସେବା ସାମୟିକ ଭାବରେ ଅନୁପଲବ୍ଧ ଅଛି | ଦୟାକରି କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |"
        }
        
        return error_messages.get(language, error_messages["en"])

    
    async def get_recommendations(self, user_profile: Dict) -> List[Dict]:
        """Get personalized recommendations based on user profile"""
        
        community_type = user_profile.get("community_type", "general")
        
        # Simple rule-based recommendations
        recommendations = []
        
        if community_type == "farmer":
            recommendations.extend([
                {
                    "icon": "🌾",
                    "title": "PM-KISAN Scheme",
                    "description": "Direct income support of ₹6000 per year for farmers",
                    "category": "Government Scheme"
                },
                {
                    "icon": "🚜",
                    "title": "e-NAM Market Access",
                    "description": "Connect your farm produce to national markets for better pricing",
                    "category": "Market Access"
                },
                {
                    "icon": "📚",
                    "title": "Modern Farming Techniques",
                    "description": "Learn about sustainable and efficient farming methods",
                    "category": "Education"
                }
            ])
        
        elif community_type == "student":
            recommendations.extend([
                {
                    "icon": "🎓",
                    "title": "Scholarship Programs",
                    "description": "Explore various scholarship opportunities for students",
                    "category": "Education"
                },
                {
                    "icon": "💼",
                    "title": "Skill Development Courses",
                    "description": "Free courses to enhance your employability",
                    "category": "Learning"
                }
            ])
        
        elif community_type == "business":
            recommendations.extend([
                {
                    "icon": "💰",
                    "title": "MUDRA Loan Scheme",
                    "description": "Loans up to ₹10 lakhs for small businesses",
                    "category": "Government Scheme"
                },
                {
                    "icon": "📈",
                    "title": "ONDC Marketplace",
                    "description": "Sell your products digitally across India through ONDC",
                    "category": "Market Access"
                },
                {
                    "icon": "📊",
                    "title": "Business Management Course",
                    "description": "Learn essential business and financial management skills",
                    "category": "Learning"
                }
            ])
        
        else:
            recommendations.extend([
                {
                    "icon": "🏥",
                    "title": "Ayushman Bharat",
                    "description": "Free health insurance coverage up to ₹5 lakhs",
                    "category": "Healthcare"
                },
                {
                    "icon": "💻",
                    "title": "Digital Literacy Program",
                    "description": "Learn basic computer and internet skills",
                    "category": "Education"
                }
            ])
        
        return recommendations
