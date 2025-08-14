import json
from typing import Dict, List
from dotenv import load_dotenv
from openai import OpenAI
import sys


load_dotenv()


def initialize_client(use_ollama: bool = False) -> OpenAI:
   """Initialize the OpenAI client based on the use_ollama flag."""
   if use_ollama:
       return OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
   return OpenAI()


def create_initial_messages() -> List[Dict[str, str]]:
   """Create the initial messages for the chatbot."""
   return [
       {"role": "system", "content": "You are a helpful assistant."},
   ]


def chat(
   use_input: str, messages: List[Dict[str, str]], client: OpenAI, model_name: str
) -> str:
   """Process the user's input and return the chatbot's response."""
   messages.append({"role": "user", "content": use_input})
  
   try:
       response = client.chat.completions.create(
           model=model_name,
           messages=messages
       )
       assistant_response = response.choices[0].message.content.strip()
       messages.append({"role": "assistant", "content": assistant_response})
       return assistant_response
   except Exception as e:
       print(f"An error occurred: {str(e)}")
       return "An error occurred. Please try again."
  


def summarize_messages(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
   """Summarize older messages to save tokens."""
   summary = "Previous conversation summarized: " + " ".join(
       [m["content"][:50] + "..." for m in messages[-5:]]
   )
   return [{"role": "system", "content": summary}] + messages[-5:]
          
def save_conversation(messages: List[Dict[str, str]], filename: str = "conversation.json"):
   """Save the conversation to a JSON file."""
   with open(filename, "w") as f:
       json.dump(messages, f)


def load_conversation(filename: str = "conversation.json") -> List[Dict[str, str]]:
   """Load the conversation from a JSON file."""
   try:
       with open(filename, "r") as f:
           return json.load(f)
   except FileNotFoundError:
       print(f"No conversation file found at {filename}. Starting fresh.")
       return create_initial_messages()
  
def main():
   print("Select model type:")
   print("1. Ollama (local)")
   print("2. OpenAI (remote)")
   model_choice = input("Enter the number: ")
  
   use_ollama = model_choice == "1"
  
   client = initialize_client(use_ollama)
   model_name = "llama3.2" if use_ollama else "gpt-4o-mini"
  
   messages = create_initial_messages()
  
   print(f"\n Using {'Ollama' if use_ollama else 'OpenAI'} model: {model_name}")
   print("Available commands:")
   print("- 'save': Save conversation")
   print("= 'load': Load Conversation")
   print("- 'summary': Summarize conversation")
  
   while True:
       user_input = input("\nYou: ")
      
       if user_input.lower() == "quit":
           break
      
       if user_input.lower() == "save":
           save_conversation(messages)
           print("Conversation saved.")
           continue
       elif user_input.lower() == "load":
           messages = load_conversation()
           print("Conversation loaded.")
           continue
       elif user_input.lower() == "summary":
           messages = summarize_messages(messages)
           print("Conversation summarized.")
           continue
      
       response = chat(user_input, messages, client, model_name)
       print(f"\nAssistant: {response}")
      
       if len(messages) > 10:
           messages = summarize_messages(messages)
           print("Conversation summarized to save tokens.")
          
if __name__ == "__main__":
   main()