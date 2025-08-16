from typing import List, Dict
import requests
import json
from config.config import url, model
from utils.constant import reminder_prompt

def handle_request(user_input: str, max_tokens=1000, temperature=0.5, conversation_history: List[Dict[str, str]] = None):
    try:
        # Use reminder_prompt to get properly formatted messages
        messages = reminder_prompt(user_input, conversation_history=conversation_history)
        prompt = ""
        for msg in messages:
            if msg["role"] == "system":
                prompt += f"System: {msg['content']}\n\n"
            elif msg["role"] == "user":
                prompt += f"User: {msg['content']}\n\n"
            elif msg["role"] == "assistant":
                prompt += f"Assistant: {msg['content']}\n\n"
        
        prompt += "Assistant: "
        
        data = {
            "prompt": prompt,
            "model": model or "gemma2:2b",
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        response = requests.post(url, json=data, timeout=30, stream=True)
        response.raise_for_status() # Raise an exception for bad status codes
        
        # Handle streaming response from Ollama
        full_response = ""
        for line in response.iter_lines():
            if line:
                try:
                    json_line = line.decode('utf-8')
                    if json_line.strip(): # Skip empty lines
                        json_data = json.loads(json_line)
                        if 'response' in json_data:
                            full_response += json_data['response']
                        if json_data.get('done', False):
                            break
                except (ValueError, json.JSONDecodeError) as e:
                    # Skip malformed JSON lines
                    continue
        
        return full_response
        
    except requests.exceptions.ConnectionError:
        raise Exception("AI service is not running. Please start the Ollama service on localhost:11434")
    except requests.exceptions.Timeout:
        raise Exception("AI service request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error communicating with AI service: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")

def handle_conversation_with_history(user_input: str, conversation_history: List[Dict[str, str]], max_tokens=1000, temperature=0.5):
    """
    Handle a conversation request with full conversation history.
    
    Args:
        user_input: Current user input
        conversation_history: List of previous messages in the conversation
        max_tokens: Maximum tokens for the response
        temperature: Temperature for response generation
        
    Returns:
        AI response as string
    """
    return handle_request(user_input, max_tokens, temperature, conversation_history)

def handle_stream_request(user_input: str, max_tokens=1000, temperature=0.5, conversation_history: List[Dict[str, str]] = None):
    """Streaming version that yields each response chunk"""
    messages = reminder_prompt(user_input, conversation_history=conversation_history)
    prompt = ""
    for msg in messages:
        if msg["role"] == "system":
            prompt += f"System: {msg['content']}\n\n"
        elif msg["role"] == "user":
            prompt += f"User: {msg['content']}\n\n"
        elif msg["role"] == "assistant":
            prompt += f"Assistant: {msg['content']}\n\n"
    
    prompt += "Assistant: "
    
    try:
        data = {
            "prompt": prompt,
            "model": model or "gemma2:2b",
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        response = requests.post(url, json=data, timeout=30, stream=True)
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                try:
                    json_line = line.decode('utf-8')
                    if json_line.strip():
                        json_data = json.loads(json_line)
                        if 'response' in json_data:
                            yield json_data['response']
                        if json_data.get('done', False):
                            break
                except (ValueError, json.JSONDecodeError) as e:
                    continue
                    
    except requests.exceptions.ConnectionError:
        raise Exception("AI service is not running. Please start the Ollama service on localhost:11434")
    except requests.exceptions.Timeout:
        raise Exception("AI service request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error communicating with AI service: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")






