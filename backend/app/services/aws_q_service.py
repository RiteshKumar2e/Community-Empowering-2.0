"""
Amazon Q Service Integration
Provides intelligent Q&A, business analytics, and personalized recommendations.
"""

import os
import json
import boto3
from typing import Optional, Dict, List
from botocore.exceptions import ClientError


class AmazonQService:
    """Service for interacting with Amazon Q Business"""
    
    def __init__(self):
        """Initialize Amazon Q client"""
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        
        self.q_client = None
        self.q_app_id = os.getenv("AWS_Q_APPLICATION_ID")
        
        if self.aws_access_key and self.aws_secret_key:
            try:
                self.q_client = boto3.client(
                    service_name='qbusiness',
                    region_name=self.aws_region,
                    aws_access_key_id=self.aws_access_key,
                    aws_secret_access_key=self.aws_secret_key
                )
                if self.q_app_id:
                    print("✓ Amazon Q client initialized successfully")
                else:
                    print("⚠ Amazon Q Application ID not found. Q service disabled.")
            except Exception as e:
                print(f"⚠ Failed to initialize Amazon Q: {e}")
        else:
            print("⚠ AWS credentials not found. Amazon Q service disabled.")
    
    def is_available(self) -> bool:
        """Check if Amazon Q service is available"""
        return self.q_client is not None and self.q_app_id is not None
    
    async def ask_question(
        self,
        question: str,
        context: Optional[Dict] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Ask a question to Amazon Q
        
        Args:
            question: User question
            context: Additional context
            user_id: User identifier
            
        Returns:
            Dictionary with answer and sources
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            # Prepare the request
            request_params = {
                'applicationId': self.q_app_id,
                'userMessage': question
            }
            
            if user_id:
                request_params['userId'] = user_id
            
            # Add context if provided
            if context:
                context_str = json.dumps(context)
                request_params['userMessage'] = f"{question}\n\nContext: {context_str}"
            
            # Call Amazon Q
            response = self.q_client.chat_sync(**request_params)
            
            # Extract answer and sources
            result = {
                'answer': response.get('systemMessage', ''),
                'sources': [],
                'conversation_id': response.get('conversationId'),
                'message_id': response.get('systemMessageId')
            }
            
            # Extract source attributions if available
            if 'sourceAttributions' in response:
                for source in response['sourceAttributions']:
                    result['sources'].append({
                        'title': source.get('title', ''),
                        'url': source.get('url', ''),
                        'snippet': source.get('snippet', '')
                    })
            
            return result
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Amazon Q API error ({error_code}): {error_message}")
        except Exception as e:
            raise Exception(f"Error calling Amazon Q: {str(e)}")
    
    async def analyze_query(self, query: str, context: Optional[Dict] = None) -> Dict:
        """
        Analyze user query to understand intent and extract information
        
        Args:
            query: User query
            context: Additional context
            
        Returns:
            Dictionary with query analysis
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            analysis_prompt = f"""Analyze this user query and provide:
1. Intent (information, action, navigation, etc.)
2. Category (government_scheme, education, employment, etc.)
3. Key entities/keywords
4. Suggested action
5. Urgency level (low, medium, high)

Query: {query}

Respond in JSON format."""
            
            response = await self.ask_question(analysis_prompt, context)
            
            # Parse the response
            try:
                analysis = json.loads(response['answer'])
            except:
                # If not JSON, create structured response
                analysis = {
                    'intent': 'information',
                    'category': 'general',
                    'keywords': query.split()[:5],
                    'suggested_action': 'Provide relevant information',
                    'urgency': 'medium'
                }
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Error analyzing query: {str(e)}")
    
    async def get_learning_path(
        self,
        goals: List[str],
        current_skills: List[str],
        context: Optional[Dict] = None
    ) -> Dict:
        """
        Generate personalized learning path
        
        Args:
            goals: User's learning goals
            current_skills: Current skills
            context: Additional context
            
        Returns:
            Dictionary with learning path recommendations
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            prompt = f"""Create a personalized learning path for:

Goals: {', '.join(goals)}
Current Skills: {', '.join(current_skills)}

Provide:
1. Step-by-step learning path
2. Recommended courses/resources
3. Estimated timeline
4. Key milestones

Respond in JSON format with structured learning path."""
            
            response = await self.ask_question(prompt, context)
            
            return {
                'learning_path': response['answer'],
                'sources': response.get('sources', [])
            }
            
        except Exception as e:
            raise Exception(f"Error generating learning path: {str(e)}")
    
    async def get_business_insights(
        self,
        metrics: Dict,
        time_period: str = "last_month"
    ) -> Dict:
        """
        Get business insights and analytics
        
        Args:
            metrics: Platform metrics
            time_period: Time period for analysis
            
        Returns:
            Dictionary with insights and recommendations
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            prompt = f"""Analyze these platform metrics and provide insights:

Metrics: {json.dumps(metrics, indent=2)}
Time Period: {time_period}

Provide:
1. Key insights
2. Trends analysis
3. Recommendations for improvement
4. Potential issues to address

Respond with detailed analysis."""
            
            response = await self.ask_question(prompt)
            
            return {
                'answer': response['answer'],
                'insights': response.get('sources', [])
            }
            
        except Exception as e:
            raise Exception(f"Error getting business insights: {str(e)}")
    
    async def recommend_schemes(
        self,
        location: str,
        community_type: str,
        additional_filters: Optional[Dict] = None
    ) -> Dict:
        """
        Recommend government schemes based on user profile
        
        Args:
            location: User location
            community_type: Type of community
            additional_filters: Additional filtering criteria
            
        Returns:
            Dictionary with scheme recommendations
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            prompt = f"""Recommend relevant government schemes for:

Location: {location}
Community Type: {community_type}
"""
            
            if additional_filters:
                prompt += f"\nAdditional Criteria: {json.dumps(additional_filters)}"
            
            prompt += """

Provide:
1. Top 5 most relevant schemes
2. Eligibility criteria for each
3. How to apply
4. Benefits and features

Respond in JSON format with scheme details."""
            
            response = await self.ask_question(prompt)
            
            return {
                'recommendations': response['answer'],
                'sources': response.get('sources', [])
            }
            
        except Exception as e:
            raise Exception(f"Error recommending schemes: {str(e)}")
    
    async def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Text to analyze
            
        Returns:
            Language code (en, hi, etc.)
        """
        if not self.is_available():
            raise Exception("Amazon Q service not available")
        
        try:
            prompt = f"""Detect the language of this text and respond with only the ISO 639-1 language code (e.g., 'en' for English, 'hi' for Hindi):

Text: {text}

Respond with only the language code, nothing else."""
            
            response = await self.ask_question(prompt)
            language_code = response['answer'].strip().lower()[:2]
            
            return language_code
            
        except Exception as e:
            # Default to English if detection fails
            return "en"
