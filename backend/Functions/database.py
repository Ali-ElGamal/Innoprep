import json

def load_recent_messages():

  
  file_name = "stored_data.json"
  learn_instruction = {"role": "system", 
                       "content": "You are Innoprep, an interview training chatbot. You will ask the user their name, which tech position they want to be interviewed for, and relevant questions based on their level. Keep responses under 30 words and be informative and friendly.give a report on how the user performed in the interview when asked and how ready the user is for applying to jobs. Ask questions One by One."}

  # Initialize messages
  messages = []
  messages = []

  learn_instruction["content"] = learn_instruction["content"] + "Your response will include relevant questions based on the user's level."

  messages.append(learn_instruction)

    
  try:
        with open(file_name) as user_file:
            data = json.load(user_file)

           
            if data:
                if len(data) < 5:
                    for item in data:
                        messages.append(item)
                else:
                    for item in data[-5:]:
                        messages.append(item)
  except:
        pass
  return messages



def save_messages(request_message, response_message):
  file_name = "stored_data.json"
  messages = load_recent_messages()[1:]
  user_message = {"role": "user", "content": request_message}
  assistant_message = {"role": "assistant", "content": response_message}
  messages.append(user_message)
  messages.append(assistant_message)


  with open(file_name, "w") as f:
    json.dump(messages, f)



def reset_conversation():

  file_name = "stored_data.json"
  open(file_name, "w")
