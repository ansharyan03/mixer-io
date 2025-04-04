import fastapi
from fastapi.responses import StreamingResponse
from audio_io import AudioWrapper
from pydantic import BaseModel
from dotenv import load_dotenv
from os import getenv
import httpx
import numpy as np
import io
from file_reader import read_tunnel
import soundfile as sf
from matplotlib import pyplot as plt


app = fastapi.FastAPI()

load_dotenv()

class Songs(BaseModel):
    url1: str
    url2: str

def merge_songs(song1: AudioWrapper, song2: AudioWrapper):
    if song1.vocals.shape[1] > song2.vocals.shape[1]:
        song2.vocals = np.append(song2.vocals, np.zeros((2, song1.vocals.shape[1] - song2.vocals.shape[1])), axis=1)
        song2.instrumental = np.append(song2.instrumental, np.zeros((2, song1.instrumental.shape[1] - song2.instrumental.shape[1])), axis=1)
    else:
        song1.vocals = np.append(song1.vocals, np.zeros((2, song2.vocals.shape[1] - song1.vocals.shape[1])), axis=1)
        song1.instrumental = np.append(song1.instrumental, np.zeros((2, song2.instrumental.shape[1] - song1.instrumental.shape[1])), axis=1)

@app.post("/")
async def process_songs(songs: Songs):
    url = getenv('COBALT_URL')
    async with httpx.AsyncClient() as client:
        headers = {"Content-Type": "application/json", "Accept":"application/json"}
        
        body1 = {"url": songs.url1, "downloadMode": "audio", "audioFormat": "wav"}
        body2 = {"url": songs.url2, "downloadMode": "audio", "audioFormat": "wav"}
        # print(body1, body2)
        tunnel1 = await client.post(url, json=body1, headers=headers)
        tunnel2 = await client.post(url, json=body2, headers=headers)
        # print(tunnel1, tunnel2)
        song1 = tunnel1.json()
        song2 = tunnel2.json()
        wave1 = None
        sr1 = None
        wave2 = None
        sr2 = None
        if song1['status'] == 'tunnel' and song2['status'] == 'tunnel':
            data1 = read_tunnel(song1['url'], 'WAV')
            data2 = read_tunnel(song2['url'], 'WAV')
            wave1, sr1 = data1
            wave2, sr2 = data2
        # print(wave1, wave2)
        # print(song1)
        song1 = AudioWrapper(data=wave1, sr=sr1, name=song1['filename'])
        song2 = AudioWrapper(data=wave2, sr=sr2, name=song2['filename'])
        song1.split()
        song2.split()
        merge_songs(song1, song2)
        
        result = ((np.transpose((song1.instrumental/2) + (song2.vocals/2)))*32768.0).astype(np.int16)
        # print(type(song1.vocals))
        buf = io.BytesIO()
        sf.write(buf, result, song1.sr, format='WAV', subtype='PCM_16')
        buf.seek(0)
        # BPM stretch
        # Pitch stretch
        # Mix
        # Output stems to S3 and save to database
        return StreamingResponse(buf, media_type="audio/wav")
