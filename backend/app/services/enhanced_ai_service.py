"""
Enhanced AI Service
Combines Amazon Q, AWS Bedrock, Groq, and Gemini with intelligent fallback.
"""

from typing import Optional, Dict, List
from app.services.aws_bedrock_service import AWSBedrockService
from app.services.aws_q_service import AmazonQService
from app.services.ai_service import AIService


class EnhancedAIService:
    """
    Enhanced AI service that intelligently routes requests to the best available provider
    Priority: Amazon Q → AWS Bedrock → Groq → Gemini
    """
    
    def __init__(self):
        """Initialize all AI services"""
        self.q_service = AmazonQService()
        self.bedrock_service = AWSBedrockService()
        self.groq_gemini_service = AIService()
        
        # Track service availability
        self.services_available = {
            "amazon_q": self.q_service.is_available(),
            "aws_bedrock": self.bedrock_service.is_available(),
            "groq": True,  # Assumed available via AIService
            "gemini": True  # Assumed available via AIService
        }
        
        print(f"Enhanced AI Service initialized:")
        print(f"  - Amazon Q: {'✓' if self.services_available['amazon_q'] else '✗'}")
        print(f"  - AWS Bedrock: {'✓' if self.services_available['aws_bedrock'] else '✗'}")
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
        response = None
        
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
        
        # Phase 2: Try AWS Bedrock
        if self.services_available["aws_bedrock"]:
            print("🔍 Attempting AWS Bedrock...")
            try:
                response = await self.bedrock_service.get_chat_response(
                    message=message,
                    language=language,
                    context=context,
                    model=model
                )
                if response:
                    print("✓ Success with AWS Bedrock")
                    return response
            except Exception as e:
                print(f"⚠ AWS Bedrock failed: {e}")
        
        # Phase 3: Fallback to Groq/Gemini
        print("🔍 Falling back to Groq/Gemini...")
        response = await self.groq_gemini_service.get_chat_response(
            message=message,
            language=language,
            context=context,
            model=model
        )
        
        return response
    
    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment using best available service
        
        Args:
            text: Text to analyze
            
        Returns:
            Sentiment analysis results
        """
        # Try Bedrock first for sentiment analysis
        if self.services_available["aws_bedrock"]:
            try:
                return await self.bedrock_service.analyze_sentiment(text)
            except Exception as e:
                print(f"⚠ Bedrock sentiment analysis failed: {e}")
        
        # Fallback to Groq/Gemini
        return await self.groq_gemini_service.analyze_sentiment(text)
    
    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate text embeddings
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if self.services_available["aws_bedrock"]:
            try:
                return await self.bedrock_service.generate_embeddings(text)
            except Exception as e:
                print(f"⚠ Bedrock embeddings failed: {e}")
        
        # Fallback to Groq/Gemini
        return await self.groq_gemini_service.generate_embeddings(text)
    
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
        elif self.services_available["aws_bedrock"]:
            return "AWS Bedrock"
        else:
            return "Groq/Gemini"
    
    def _count_total_models(self) -> int:
        """Count total available models"""
        count = 0
        if self.services_available["aws_bedrock"]:
            count += len(self.bedrock_service.get_available_models())
        # Groq has ~40 models, Gemini has ~10
        count += 50
        return count
    
    def get_available_models(self) -> Dict:
        """Get all available models"""
        models = {
            "bedrock": [],
            "groq": [],
            "gemini": []
        }
        
        if self.services_available["aws_bedrock"]:
            models["bedrock"] = list(self.bedrock_service.get_available_models().keys())
        
        # Groq and Gemini models from AIService
        models["groq"] = self.groq_gemini_service.groq_models
        models["gemini"] = self.groq_gemini_service.gemini_models
        
        return models
