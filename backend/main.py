from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai


#import functions
from Functions.text_to_speech import generate_text_to_speech
from Functions.bot_requests import audiototext, chatres
from Functions.database import save_messages, reset_conversation


openai.organization = config("OPEN_AI_ORG")
openai.api_key = config("OPEN_AI_KEY")


# Initiate App
app = FastAPI()


# CORS - Origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]


# CORS - Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Endpoint to check health
@app.get("/health")
async def check_health():
    return {"status": "healthy"}


# Endpoint to reset conversation
@app.get("/reset")
async def reset_conversation_endpoint():
    reset_conversation()
    return {"message": "conversation reset"}

# post method 
@app.post("/post-audio/")
async def post_audio(file: UploadFile = File(...)):

    # Convert audio to text this Saves the file temporarily
    with open(file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    audio_input = open(file.filename, "rb")

    # Decode audio
    message_decoded = audiototext(audio_input)

    
    if not message_decoded:
        raise HTTPException(status_code=400, detail="Failed to decode audio")

    
    chat_response = chatres(message_decoded)
    save_messages(message_decoded, chat_response)

    
    if not chat_response:
        raise HTTPException(status_code=400, detail="Failed chat response")
    audio_output = generate_text_to_speech(chat_response)

    
    if not audio_output:
        raise HTTPException(status_code=400, detail="Failed audio output")
    def iterfile():
        yield audio_output

    
    return StreamingResponse(iterfile(), media_type="application/octet-stream")
