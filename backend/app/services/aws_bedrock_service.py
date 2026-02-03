"""
AWS Bedrock Service Integration
Provides access to Amazon Bedrock AI models including Claude, Llama, Titan, and more.
"""

import os
import json
import boto3
from typing import Optional, Dict, List
from botocore.exceptions import ClientError


class AWSBedrockService:
    """Service for interacting with AWS Bedrock AI models"""
    
    def __init__(self):
        """Initialize AWS Bedrock client"""
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        
        self.bedrock_client = None
        if self.aws_access_key and self.aws_secret_key:
            try:
                self.bedrock_client = boto3.client(
                    service_name='bedrock-runtime',
                    region_name=self.aws_region,
                    aws_access_key_id=self.aws_access_key,
                    aws_secret_access_key=self.aws_secret_key
                )
                print("✓ AWS Bedrock client initialized successfully")
            except Exception as e:
                print(f"⚠ Failed to initialize AWS Bedrock: {e}")
        else:
            print("⚠ AWS credentials not found. Bedrock service disabled.")
        
        # Available Bedrock models
        self.models = {
            # Anthropic Claude models
            "claude-3-opus": "anthropic.claude-3-opus-20240229-v1:0",
            "claude-3-sonnet": "anthropic.claude-3-sonnet-20240229-v1:0",
            "claude-3-haiku": "anthropic.claude-3-haiku-20240307-v1:0",
            "claude-instant": "anthropic.claude-instant-v1",
            "claude-v2": "anthropic.claude-v2",
            
            # Meta Llama models
            "llama3-70b": "meta.llama3-70b-instruct-v1:0",
            "llama3-8b": "meta.llama3-8b-instruct-v1:0",
            "llama2-70b": "meta.llama2-70b-chat-v1",
            "llama2-13b": "meta.llama2-13b-chat-v1",
            
            # Amazon Titan models
            "titan-text-express": "amazon.titan-text-express-v1",
            "titan-text-lite": "amazon.titan-text-lite-v1",
            "titan-embed-text": "amazon.titan-embed-text-v1",
            "titan-embed-image": "amazon.titan-embed-image-v1",
            
            # Cohere models
            "cohere-command": "cohere.command-text-v14",
            "cohere-command-light": "cohere.command-light-text-v14",
            
            # AI21 Labs models
            "ai21-jurassic-ultra": "ai21.j2-ultra-v1",
            "ai21-jurassic-mid": "ai21.j2-mid-v1",
            
            # Stability AI
            "stable-diffusion-xl": "stability.stable-diffusion-xl-v1"
        }
        
        self.default_model = "claude-3-haiku"
    
    def is_available(self) -> bool:
        """Check if Bedrock service is available"""
        return self.bedrock_client is not None
    
    async def get_chat_response(
        self,
        message: str,
        language: str = "en",
        context: Optional[Dict] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Get chat response from Bedrock model
        
        Args:
            message: User message
            language: Language code (en, hi, etc.)
            context: Additional context
            model: Model name (optional)
            
        Returns:
            AI response text
        """
        if not self.is_available():
            raise Exception("AWS Bedrock service not available")
        
        model_name = model or self.default_model
        model_id = self.models.get(model_name, self.models[self.default_model])
        
        try:
            # Prepare system prompt based on language
            system_prompt = self._get_system_prompt(language, context)
            
            # Build request based on model type
            if "claude" in model_id:
                response = await self._invoke_claude(model_id, message, system_prompt)
            elif "llama" in model_id:
                response = await self._invoke_llama(model_id, message, system_prompt)
            elif "titan" in model_id:
                response = await self._invoke_titan(model_id, message, system_prompt)
            elif "cohere" in model_id:
                response = await self._invoke_cohere(model_id, message, system_prompt)
            elif "ai21" in model_id:
                response = await self._invoke_ai21(model_id, message, system_prompt)
            else:
                response = await self._invoke_claude(self.models[self.default_model], message, system_prompt)
            
            return response
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Bedrock API error ({error_code}): {error_message}")
        except Exception as e:
            raise Exception(f"Error calling Bedrock: {str(e)}")
    
    async def _invoke_claude(self, model_id: str, message: str, system_prompt: str) -> str:
        """Invoke Claude model"""
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": message
                }
            ],
            "temperature": 0.7,
            "top_p": 0.9
        })
        
        response = self.bedrock_client.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']
    
    async def _invoke_llama(self, model_id: str, message: str, system_prompt: str) -> str:
        """Invoke Llama model"""
        prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"
        
        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 2000,
            "temperature": 0.7,
            "top_p": 0.9
        })
        
        response = self.bedrock_client.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['generation']
    
    async def _invoke_titan(self, model_id: str, message: str, system_prompt: str) -> str:
        """Invoke Titan model"""
        prompt = f"{system_prompt}\n\n{message}"
        
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 2000,
                "temperature": 0.7,
                "topP": 0.9
            }
        })
        
        response = self.bedrock_client.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['results'][0]['outputText']
    
    async def _invoke_cohere(self, model_id: str, message: str, system_prompt: str) -> str:
        """Invoke Cohere model"""
        prompt = f"{system_prompt}\n\n{message}"
        
        body = json.dumps({
            "prompt": prompt,
            "max_tokens": 2000,
            "temperature": 0.7,
            "p": 0.9
        })
        
        response = self.bedrock_client.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['generations'][0]['text']
    
    async def _invoke_ai21(self, model_id: str, message: str, system_prompt: str) -> str:
        """Invoke AI21 model"""
        prompt = f"{system_prompt}\n\n{message}"
        
        body = json.dumps({
            "prompt": prompt,
            "maxTokens": 2000,
            "temperature": 0.7,
            "topP": 0.9
        })
        
        response = self.bedrock_client.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['completions'][0]['data']['text']
    
    def _get_system_prompt(self, language: str, context: Optional[Dict] = None) -> str:
        """Get system prompt based on language and context"""
        base_prompts = {
            "en": "You are a helpful AI assistant for a community empowerment platform. Provide clear, accurate, and helpful responses.",
            "hi": "आप एक सामुदायिक सशक्तिकरण मंच के लिए एक सहायक AI सहायक हैं। स्पष्ट, सटीक और सहायक उत्तर प्रदान करें।"
        }
        
        prompt = base_prompts.get(language, base_prompts["en"])
        
        if context:
            if context.get("location"):
                prompt += f"\nUser location: {context['location']}"
            if context.get("communityType"):
                prompt += f"\nCommunity type: {context['communityType']}"
        
        return prompt
    
    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment of text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment analysis results
        """
        if not self.is_available():
            raise Exception("AWS Bedrock service not available")
        
        try:
            prompt = f"""Analyze the sentiment of the following text and provide:
1. Overall sentiment (positive, negative, or neutral)
2. Confidence score (0-1)
3. Key emotions detected

Text: {text}

Respond in JSON format:
{{
    "sentiment": "positive|negative|neutral",
    "confidence": 0.95,
    "key_emotions": ["joy", "excitement"]
}}"""
            
            response = await self._invoke_claude(
                self.models[self.default_model],
                prompt,
                "You are a sentiment analysis expert. Provide accurate sentiment analysis in JSON format."
            )
            
            # Parse JSON response
            result = json.loads(response)
            return result
            
        except Exception as e:
            raise Exception(f"Error analyzing sentiment: {str(e)}")
    
    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate text embeddings
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding values
        """
        if not self.is_available():
            raise Exception("AWS Bedrock service not available")
        
        try:
            body = json.dumps({
                "inputText": text
            })
            
            response = self.bedrock_client.invoke_model(
                modelId=self.models["titan-embed-text"],
                body=body
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['embedding']
            
        except Exception as e:
            raise Exception(f"Error generating embeddings: {str(e)}")
    
    def get_available_models(self) -> Dict[str, str]:
        """Get list of available models"""
        return self.models
