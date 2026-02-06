"""
Enhanced AI Service
Combines Amazon Q, Groq, and Gemini with intelligent fallback.
"""

from typing import Optional, Dict, List
from app.services.aws_q_service import AmazonQService
from app.services.ai_service import AIService


class EnhancedAIService:
    """
    Enhanced AI service that intelligently routes requests to the best available provider
    Priority: Amazon Q → Groq → Gemini
    """
    
    def __init__(self):
        """Initialize all AI services"""
        self.q_service = AmazonQService()
        self.ai_service = AIService()
        
        # Track service availability
        self.services_available = {
            "amazon_q": self.q_service.is_available(),
            "groq": True,
            "gemini": True
        }
        
        print(f"Enhanced AI Service initialized:")
        print(f"  - Amazon Q: {'✓' if self.services_available['amazon_q'] else '✗'}")
        print(f"  - Groq/Gemini: ✓")
    
    
    async def get_chat_response(
        self,
        message: str,
        language: str = "en",
        context: Optional[Dict] = None,
        model: Optional[str] = None,
        use_q: bool = True
    ) -> str:
        """
        Get chat response with intelligent provider selection
        
        Args:
            message: User message
            language: Language code
            context: Additional context
            model: Specific model to use
            use_q: Whether to try Amazon Q first
            
        Returns:
            AI response text
        """
        # Phase 1: Try Amazon Q (if enabled and available)
        if use_q and self.services_available["amazon_q"]:
            print("🔍 Attempting Amazon Q...")
            try:
                q_response = await self.q_service.ask_question(
                    question=message,
                    context=context,
                    user_id=context.get('user_id') if context else None
                )
                if q_response and q_response.get('answer'):
                    print("✓ Success with Amazon Q")
                    return q_response['answer']
            except Exception as e:
                print(f"⚠ Amazon Q failed: {e}")
        
        # Phase 2: Fallback to Groq/Gemini
        print("🔍 Using Groq/Gemini...")
        response = await self.ai_service.get_chat_response(
            message=message,
            language=language,
            context=context,
            model=model
        )
        
        return response
    
    
    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment using Groq/Gemini
        
        Args:
            text: Text to analyze
            
        Returns:
            Sentiment analysis results
        """
        return await self.ai_service.analyze_sentiment(text)
    
    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate text embeddings
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        return await self.ai_service.generate_embeddings(text)
    
    
    async def get_recommendations(
        self,
        location: str,
        community_type: str,
        additional_filters: Optional[Dict] = None
    ) -> Dict:
        """
        Get scheme recommendations
        
        Args:
            location: User location
            community_type: Community type
            additional_filters: Additional filters
            
        Returns:
            Recommendations
        """
        # Use Amazon Q if available
        if self.services_available["amazon_q"]:
            try:
                return await self.q_service.recommend_schemes(
                    location=location,
                    community_type=community_type,
                    additional_filters=additional_filters
                )
            except Exception as e:
                print(f"⚠ Amazon Q recommendations failed: {e}")
        
        # Fallback to regular AI service
        prompt = f"Recommend government schemes for {community_type} in {location}"
        if additional_filters:
            prompt += f" with criteria: {additional_filters}"
        
        response = await self.get_chat_response(prompt, use_q=False)
        return {"recommendations": response, "sources": []}
    
    
    async def get_learning_path(
        self,
        goals: List[str],
        current_skills: List[str],
        context: Optional[Dict] = None
    ) -> Dict:
        """
        Generate learning path
        
        Args:
            goals: Learning goals
            current_skills: Current skills
            context: Additional context
            
        Returns:
            Learning path
        """
        # Use Amazon Q if available
        if self.services_available["amazon_q"]:
            try:
                return await self.q_service.get_learning_path(
                    goals=goals,
                    current_skills=current_skills,
                    context=context
                )
            except Exception as e:
                print(f"⚠ Amazon Q learning path failed: {e}")
        
        # Fallback to regular AI service
        prompt = f"Create a learning path for goals: {', '.join(goals)}. Current skills: {', '.join(current_skills)}"
        response = await self.get_chat_response(prompt, use_q=False)
        return {"learning_path": response, "sources": []}
    
    async def get_business_insights(
        self,
        metrics: Dict,
        time_period: str = "last_month"
    ) -> Dict:
        """
        Get business insights
        
        Args:
            metrics: Platform metrics
            time_period: Time period
            
        Returns:
            Business insights
        """
        # Use Amazon Q if available
        if self.services_available["amazon_q"]:
            try:
                return await self.q_service.get_business_insights(
                    metrics=metrics,
                    time_period=time_period
                )
            except Exception as e:
                print(f"⚠ Amazon Q insights failed: {e}")
        
        # Fallback to regular AI service
        import json
        prompt = f"Analyze these metrics and provide insights: {json.dumps(metrics)}"
        response = await self.get_chat_response(prompt, use_q=False)
        return {"answer": response, "insights": []}
    
    async def analyze_query(self, query: str, context: Optional[Dict] = None) -> Dict:
        """
        Analyze user query
        
        Args:
            query: User query
            context: Additional context
            
        Returns:
            Query analysis
        """
        # Use Amazon Q if available
        if self.services_available["amazon_q"]:
            try:
                return await self.q_service.analyze_query(query, context)
            except Exception as e:
                print(f"⚠ Amazon Q query analysis failed: {e}")
        
        # Fallback: basic analysis
        return {
            'intent': 'information',
            'category': 'general',
            'keywords': query.split()[:5],
            'suggested_action': 'Provide relevant information',
            'urgency': 'medium'
        }
    
    
    def get_service_status(self) -> Dict:
        """Get status of all services"""
        return {
            "status": "operational",
            "services": self.services_available,
            "primary_provider": self._get_primary_provider(),
            "total_models": self._count_total_models()
        }
    
    def _get_primary_provider(self) -> str:
        """Get the primary provider being used"""
        if self.services_available["amazon_q"]:
            return "Amazon Q"
        else:
            return "Groq/Gemini"
    
    def _count_total_models(self) -> int:
        """Count total available models"""
        # Groq has ~40 models, Gemini has ~10
        return 50
    
    def get_available_models(self) -> Dict:
        """Get all available models"""
        models = {
            "groq": [],
            "gemini": []
        }
        
        # Groq and Gemini models from AIService
        models["groq"] = self.ai_service.groq_models
        models["gemini"] = self.ai_service.gemini_models
        
        return models


