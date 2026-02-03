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
            - मित्रवत रहें और जवाब संक्षिप्त रखें। आवाज़ (voice) में पढ़ने के लिए टेक्स्ट बिल्कुल सादा होना चाहिए।"""
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
        error_msg = (
            "I apologize, but I'm currently experiencing technical difficulties. "
            "Both Groq and Gemini services are temporarily unavailable. "
            "Please try again in a few moments."
        )
        
        if language == "hi":
            error_msg = (
                "मुझे खेद है, लेकिन मैं वर्तमान में तकनीकी कठिनाइयों का सामना कर रहा हूं। "
                "दोनों Groq और Gemini सेवाएं अस्थायी रूप से अनुपलब्ध हैं। "
                "कृपया कुछ समय बाद पुनः प्रयास करें।"
            )
        
        return error_msg
    
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
