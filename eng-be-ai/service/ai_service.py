from typing import List, Dict, Any
import requests
import json
from config.config import url, model
from utils.constant import reminder_prompt, create_initial_messages

from service.response_summary_service import summarize_response


def _messages_to_prompt(messages: List[Dict[str, str]], suffix: str = "Assistant: ") -> str:
    """Convert list of message dicts to Ollama prompt format."""
    prompt = ""
    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "system":
            prompt += f"System: {content}\n\n"
        elif role == "user":
            prompt += f"User: {content}\n\n"
        elif role == "assistant":
            prompt += f"Assistant: {content}\n\n"
    return prompt + suffix


def handle_request(user_input: str, max_tokens=1000, temperature=0.5, conversation_history: List[Dict[str, str]] = None):
    try:
        messages = reminder_prompt(user_input, conversation_history=conversation_history)
        prompt = _messages_to_prompt(messages)
        
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
    return handle_request(user_input, max_tokens, temperature, conversation_history)


def process_chat_with_storage(
    chroma_service,
    conversation_id: str,
    user_message: str,
    max_tokens: int = 280,
    temperature: float = 0.5
) -> Dict[str, Any]:
    conversation_id = str(conversation_id).strip()
    if not conversation_id:
        raise ValueError("conversation_id cannot be empty")

    conversation_history = chroma_service.get_conversation(conversation_id)
    is_first_message = len(conversation_history) == 0

    context = ""
    if not is_first_message and len(conversation_history) > 0:
        recent_messages = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
        context = "\n".join([
            f"{msg['role'].title()}: {msg['content']}"
            for msg in recent_messages
        ]) + "\n"

    # Store user message in ChromaDB
    user_message_id = chroma_service.add_message(
        conversation_id=conversation_id,
        role="user",
        content=user_message,
        is_first_message=is_first_message
    )

    # If first message, save initial system messages to ChromaDB
    if is_first_message:
        initial_messages = create_initial_messages()
        for msg in initial_messages[:-1]:
            if msg["role"] == "system":
                chroma_service.add_message(
                    conversation_id=conversation_id,
                    role="system",
                    content=msg["content"],
                    is_first_message=False,
                    additional_metadata={"message_type": "system_prompt"}
                )
            elif msg["role"] == "assistant":
                chroma_service.add_message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=msg["content"],
                    is_first_message=False,
                    additional_metadata={"message_type": "example_response"}
                )
            elif msg["role"] == "user":
                chroma_service.add_message(
                    conversation_id=conversation_id,
                    role="user",
                    content=msg["content"],
                    is_first_message=False,
                    additional_metadata={"message_type": "example_user_input"}
                )

    # Create full prompt with context
    if is_first_message:
        formatted_messages = reminder_prompt(user_message, is_first_message=True)
        full_prompt = _messages_to_prompt(formatted_messages)
    else:
        full_prompt = context + f"User: {user_message}\nAI:"

    # Generate AI response
    ai_response = handle_request(full_prompt, max_tokens, temperature)
    ai_response = summarize_response(ai_response)
    print(f"🤖 AI Response: {ai_response[:100]}...")

    # Store AI response in ChromaDB
    ai_message_id = chroma_service.add_message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response,
        is_first_message=False
    )

    return {
        "status": "success",
        "conversation_id": conversation_id,
        "user_message_id": user_message_id,
        "ai_message_id": ai_message_id,
        "ai_response": ai_response,
        "is_first_message": is_first_message,
        "context_used": context.strip() if context else "First message - no previous context",
        "total_messages": len(conversation_history) + 2,
        "system_messages_saved": is_first_message,
        "conversation_type": "new" if is_first_message else "existing"
    }

def handle_stream_request(user_input: str, max_tokens=1000, temperature=0.5, conversation_history: List[Dict[str, str]] = None):
    """Streaming version that yields each response chunk"""
    messages = reminder_prompt(user_input, conversation_history=conversation_history)
    prompt = _messages_to_prompt(messages)

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






