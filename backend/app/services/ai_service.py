import os
from typing import Optional, Dict, List
from groq import Groq
from app.core.config import settings

class AIService:
    """AI Service for chat and recommendations using Groq API"""
    
    def __init__(self):
        self.groq_client = None
        if settings.GROQ_API_KEY:
            self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        
        # High-performance Groq Models (Top 40)
        self.groq_models = [
            "llama-3.1-405b-reasoning", "llama-3.1-70b-versatile", "llama-3.1-8b-instant",
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
        
        # System prompts for different languages
        self.system_prompts = {
            "en": """You are a helpful AI assistant for a community platform in India. 
            You help users access information about government schemes, education resources, 
            job opportunities, and community programs. 
            Specifically, you assist communities in understanding access to:
            1. Markets: Connect local produce/services to broader markets and understand pricing.
            2. Resources: Navigating local and state resources for growth and development.
            3. Programs: Understanding eligibility and application for welfare and development programs.
            Be friendly, informative, and concise. Focus on practical advice and actionable information.""",
            
            "hi": """आप भारत में एक सामुदायिक मंच के लिए एक सहायक AI सहायक हैं।
            आप उपयोगकर्ताओं को सरकारी योजनाओं, शिक्षा संसाधनों, नौकरी के अवसरों 
            और सामुदायिक कार्यक्रमों के बारे में जानकारी प्राप्त करने में मदद करते हैं।
            विशेष रूप से, आप समुदायों को निम्नलिखित तक पहुँचने में मदद करते हैं:
            1. बाज़ार: स्थानीय उत्पादों/सेवाओं को बड़े बाज़ारों से जोड़ना और मूल्य निर्धारण समझना।
            2. संसाधन: विकास और प्रगति के लिए स्थानीय और राज्य संसाधनों को समझना।
            3. कार्यक्रम: कल्याणकारी और विकास कार्यक्रमों के लिए पात्रता और आवेदन को समझना।
            मित्रवत, जानकारीपूर्ण और संक्षिप्त रहें।"""
        }
    
    async def get_chat_response(
        self, 
        message: str, 
        language: str = "en",
        context: Optional[Dict] = None,
        model: Optional[str] = None
    ) -> str:
        """Get AI chat response from Groq"""
        
        if not self.groq_client:
            return "Error: AI Service (Groq) is not configured. Please add GROQ_API_KEY to environment variables."
        
        try:
            # Prepare system prompt
            system_prompt = self.system_prompts.get(language, self.system_prompts["en"])
            
            # Add context if provided
            if context:
                community_type = context.get("communityType", "general")
                location = context.get("location", "")
                system_prompt += f"\n\nUser context: Community type: {community_type}, Location: {location}"
            
            # Use requested model or default to the most versatile one
            selected_model = model if model in self.groq_models else "llama-3.1-70b-versatile"
            
            # Call Groq API
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                model=selected_model,
                temperature=0.7,
                max_tokens=1024
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return f"Error: Failed to get response from Groq AI. Details: {str(e)}"

    
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
