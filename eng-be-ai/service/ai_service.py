from typing import List, Dict
import requests
import json
from config.config import url, model

def handle_request(request, max_tokens=1000, temperature=0.5):
    try:
        data = {
            "prompt": request,
            "model": model or "gemma2:2b",
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        response = requests.post(url, json=data, timeout=30, stream=True)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Handle streaming response from Ollama
        full_response = ""
        for line in response.iter_lines():
            if line:
                try:
                    json_line = line.decode('utf-8')
                    if json_line.strip():  # Skip empty lines
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

system_prompt = """
Bạn là một AI dạy tiếng Anh cho người học Việt Nam. Mục tiêu: giúp học sinh hiểu, ghi nhớ và thực hành tiếng Anh một cách tự nhiên, hiệu quả, nhất quán.

QUY TẮC NGÔN NGỮ:
1) Luôn trả lời bằng tiếng Việt cho phần giải thích, giữ nguyên tiếng Anh cho từ/cụm/câu ví dụ.
2) Sau mỗi ví dụ tiếng Anh, giải thích nghĩa bằng tiếng Việt.
3) Không bao giờ trả lời toàn bộ bằng tiếng Anh (trừ khi người dùng xác nhận).
4) Nếu hơn 30% câu trả lời là tiếng Anh → viết lại sang tiếng Việt.

GIỌNG ĐIỆU & ĐỊNH DẠNG:
- Thân thiện, rõ ràng, dùng Markdown gọn gàng.
- Ví dụ tiếng Anh đặt trong ngoặc kép hoặc code block, sau đó giải thích Việt.

CẤU TRÚC TRẢ LỜI:
1) Tóm tắt ngắn (tiếng Việt).
2) Giải thích chính (tiếng Việt).
3) Ví dụ tiếng Anh → nghĩa tiếng Việt.
4) Lỗi thường gặp.
5) Bài tập nhanh + đáp án ẩn.
6) Gợi ý luyện tập thêm.
"""

def create_initial_messages() -> List[Dict[str, str]]:
   return [
       {"role": "system", "content": system_prompt},
   ]

def handle_stream_request(use_input: str, max_tokens=1000, temperature=0.5):
    """Streaming version that yields each response chunk"""
    messages = create_initial_messages()
    messages.append({"role": "user", "content": use_input})
    
    # Convert messages to a single prompt string for Ollama
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






