import openai
from decouple import config
from Functions.database import load_recent_messages

openai.organization = config("OPEN_AI_ORG")
openai.api_key = config("OPEN_AI_KEY")

def audiototext(audio_file):
    """
    Convert audio file to text using OpenAI API.
    """
    try:
        transcript = openai.Audio.transcribe("whisper-1", audio_file)
        if "text" in transcript:
            return transcript["text"]
        else:
            print("Transcript does not contain 'text' key.")
            return None
    except Exception as e:
        print(f"An error occurred during audio transcription: {e}")
        return None

def chatres(message_input):
    messages = load_recent_messages()  # Get recent messages from the database
    user_message = {"role": "user", "content": message_input}  # Create a new message object for the user input
    messages.append(user_message)  # Append the user message to the list of messages

    print(messages)  # Print messages for debugging (optional)

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        # Extract the response text from the API response
        message_text = response["choices"][0]["message"]["content"]
        return message_text if message_text else None
    except Exception as e:
          print(f"An error occurred during chat response generation: {e}")
          return None