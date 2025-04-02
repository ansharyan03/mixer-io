import fastapi
from audio_io import AudioWrapper
from pydantic import BaseModel
from dotenv import load_dotenv
from os import getenv
import httpx
import numpy as np


app = fastapi.FastAPI()

load_dotenv()

class Songs(BaseModel):
    url1: str
    url2: str

@app.post("/")
async def process_songs(songs: Songs):
    url = getenv('COBALT_URL')
    async with httpx.AsyncClient() as client:
        headers = {"Content-Type": "application/json", "Accept":"application/json"}
        body1 = {"url": songs.url1, "downloadMode": "audio", "audioFormat": "mp3"}
        body2 = {"url": songs.url2, "downloadMode": "audio", "audioFormat": "mp3"}
        tunnel1 = await client.post(url, data=body1, headers=headers)
        tunnel2 = await client.post(url, data=body2, headers=headers)
        print(tunnel1, tunnel2)
        song1 = tunnel1.json()
        song2 = tunnel2.json()

        # download streams into numpy arrays
        # Initialize AudioWrappers
        # Split
        # BPM stretch
        # Pitch stretch
        # Mix
        # Output stems to S3 and save to database
        # return finished mix as audio data to frontend
        return {"tunnel 1": song1, "tunnel 2": song2}
