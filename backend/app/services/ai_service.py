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
        
        # System prompts for different languages
        self.system_prompts = {
            "en": """You are a helpful AI assistant for a community platform in India. 
            You help users access information about government schemes, education resources, 
            job opportunities, and community programs. Be friendly, informative, and concise.
            Focus on practical advice and actionable information.""",
            
            "hi": """आप भारत में एक सामुदायिक मंच के लिए एक सहायक AI सहायक हैं।
            आप उपयोगकर्ताओं को सरकारी योजनाओं, शिक्षा संसाधनों, नौकरी के अवसरों 
            और सामुदायिक कार्यक्रमों के बारे में जानकारी प्राप्त करने में मदद करते हैं।
            मित्रवत, जानकारीपूर्ण और संक्षिप्त रहें।"""
        }
    
    async def get_chat_response(
        self, 
        message: str, 
        language: str = "en",
        context: Optional[Dict] = None
    ) -> str:
        """Get AI chat response"""
        
        # If Groq API is not configured, return a fallback response
        if not self.groq_client:
            return self._get_fallback_response(message, language)
        
        try:
            # Prepare system prompt
            system_prompt = self.system_prompts.get(language, self.system_prompts["en"])
            
            # Add context if provided
            if context:
                community_type = context.get("communityType", "general")
                location = context.get("location", "")
                system_prompt += f"\n\nUser context: Community type: {community_type}, Location: {location}"
            
            # Call Groq API
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                model="mixtral-8x7b-32768",  # Fast and capable model
                temperature=0.7,
                max_tokens=1024
            )
            
            response = chat_completion.choices[0].message.content
            return response
            
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return self._get_fallback_response(message, language)
    
    def _get_fallback_response(self, message: str, language: str) -> str:
        """Fallback response when API is not available"""
        
        message_lower = message.lower()
        
        # Simple keyword-based responses
        if any(word in message_lower for word in ["scheme", "योजना", "government"]):
            if language == "hi":
                return """मैं आपकी मदद कर सकता हूं! भारत सरकार कई योजनाएं चलाती है जैसे:
                1. प्रधानमंत्री आवास योजना
                2. आयुष्मान भारत
                3. प्रधानमंत्री किसान सम्मान निधि
                4. स्वच्छ भारत मिशन
                
                कृपया बताएं कि आप किस प्रकार की योजना में रुचि रखते हैं?"""
            else:
                return """I can help you with that! The Indian government runs several schemes including:
                1. Pradhan Mantri Awas Yojana (Housing)
                2. Ayushman Bharat (Healthcare)
                3. PM-KISAN (Farmer Support)
                4. Swachh Bharat Mission
                
                What type of scheme are you interested in?"""
        
        elif any(word in message_lower for word in ["job", "नौकरी", "employment"]):
            if language == "hi":
                return """नौकरी के अवसरों के लिए, आप निम्नलिखित देख सकते हैं:
                1. सरकारी नौकरी पोर्टल
                2. स्थानीय रोजगार कार्यालय
                3. कौशल विकास कार्यक्रम
                4. स्वरोजगार योजनाएं
                
                आप किस क्षेत्र में नौकरी खोज रहे हैं?"""
            else:
                return """For job opportunities, you can explore:
                1. Government job portals
                2. Local employment offices
                3. Skill development programs
                4. Self-employment schemes
                
                What field are you looking for employment in?"""
        
        elif any(word in message_lower for word in ["education", "शिक्षा", "learn", "course"]):
            if language == "hi":
                return """शिक्षा और कौशल विकास के लिए:
                1. डिजिटल साक्षरता कार्यक्रम
                2. व्यावसायिक प्रशिक्षण
                3. ऑनलाइन पाठ्यक्रम
                4. छात्रवृत्ति कार्यक्रम
                
                आप क्या सीखना चाहते हैं?"""
            else:
                return """For education and skill development:
                1. Digital literacy programs
                2. Vocational training
                3. Online courses
                4. Scholarship programs
                
                What would you like to learn?"""
        
        else:
            if language == "hi":
                return """नमस्ते! मैं आपकी कैसे मदद कर सकता हूं? मैं निम्नलिखित में सहायता कर सकता हूं:
                - सरकारी योजनाएं
                - नौकरी के अवसर
                - शिक्षा और कौशल विकास
                - स्थानीय संसाधन
                
                कृपया मुझे बताएं कि आपको किस चीज़ में रुचि है।"""
            else:
                return """Hello! How can I help you today? I can assist with:
                - Government schemes
                - Job opportunities
                - Education and skill development
                - Local resources
                
                Please let me know what you're interested in."""
    
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
