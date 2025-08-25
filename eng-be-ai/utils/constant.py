from typing import List, Dict

# Prompt thân thiện và giống giáo viên hơn
system_prompt = r"""
You are an English teacher for Vietnamese students. 
Only output natural teacher messages in plain text (no JSON, no metadata). Keep answers short (2–3 sentences). 
Use simple English, and give small explanations or examples when needed. 
Be friendly and interactive.
"""

def create_initial_messages() -> List[Dict[str, str]]:
    return [
        {"role": "system", "content": system_prompt} 
    ]

    
def reminder_prompt(user_input: str, is_first_message: bool = False, conversation_history: List[Dict[str, str]] = None):
    """
    Create conversation messages with appropriate prompts and reminders.
    
    Args:
        user_input: The user's input message
        is_first_message: Whether this is the first message in a conversation
        conversation_history: Optional conversation history to include
        
    Returns:
        List of message dictionaries for the AI model
    """
    messages = []
    
    if is_first_message:
        # For first message, include system prompt and examples
        messages = create_initial_messages()
        messages.append({"role": "user", "content": user_input})
        return messages
    
    # For subsequent messages, include conversation history if provided
    if conversation_history:
        messages.extend(conversation_history)
    
    # Add friendly reminder for each user message
    reminder = ""
    messages.append({"role": "user", "content": f"{reminder}\n{user_input}"})
    
    return messages