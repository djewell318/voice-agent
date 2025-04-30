# app/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from openai_agents.audio import transcribe, synthesize
from openai import AsyncOpenAI
from agent import generate_reply, score_response

client = AsyncOpenAI()      # uses OPENAI_API_KEY env var
app = FastAPI()

@app.post("/voice")
async def voice_agent(audio: UploadFile = File(...)):
    # 1.  Speech → text
    transcript = await transcribe(file=audio.file, model="whisper-large-v3")
    
    # 2.  LLM reply
    reply = await generate_reply(transcript)
    
    # 3.  Score learner (optional)
    score = score_response(transcript)
    
    # 4.  Text → speech
    tts_stream = synthesize(
        text=reply,
        voice="alloy",
        format="mp3",
        stream=True
    )
    # 5.  Return multipart JSON + audio stream URL
    return JSONResponse({
        "transcript": transcript,
        "reply": reply,
        "score": score
    })

@app.get("/tts")
def tts(text: str):
    audio_iter = synthesize(text=text, voice="alloy", format="mp3", stream=True)
    return StreamingResponse(audio_iter, media_type="audio/mpeg")
