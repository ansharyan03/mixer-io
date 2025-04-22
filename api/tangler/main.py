from typing import Union
import fastapi
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from dotenv import load_dotenv
from os import getenv
import io
import asyncio

import httpx
import numpy as np

from utils.audio_proc import AudioWrapper
from utils.file_reader import read_tunnel

import soundfile as sf
from matplotlib import pyplot as plt


app = fastapi.FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()




class Songs(BaseModel):
    url1: str
    url2: str

def merge_songs(song1: AudioWrapper, song2: AudioWrapper):
    print(song1.vocals.shape, song2.vocals.shape)
    if song1.vocals.shape[1] > song2.vocals.shape[1]:
        song2.vocals = np.append(song2.vocals, np.zeros((2, song1.vocals.shape[1] - song2.vocals.shape[1])), axis=1)
        song2.instrumental = np.append(song2.instrumental, np.zeros((2, song1.instrumental.shape[1] - song2.instrumental.shape[1])), axis=1)
    else:
        song1.vocals = np.append(song1.vocals, np.zeros((2, song2.vocals.shape[1] - song1.vocals.shape[1])), axis=1)
        song1.instrumental = np.append(song1.instrumental, np.zeros((2, song2.instrumental.shape[1] - song1.instrumental.shape[1])), axis=1)
        
async def read_song(song: str, client: httpx.AsyncClient, api_url: str) -> Union[None, AudioWrapper]:
    """
    inputs:
    - song: str - song url from YouTube
    - client: httpx.AsyncClient - needed to be passed in to make POST requests
    - api_url: str - API for our local Cobalt instance

    Using the YouTube URL of a song, download it into an AudioWrapper object, ready to be manipulated/analyzed.

    Returns AudioWrapper object
    """
    headers = {"Content-Type": "application/json", "Accept":"application/json", "Authorization": "Api-Key " + getenv('API_KEY')}
    body = {"url": song, "downloadMode": "audio", "audioFormat": "wav"}
    print(api_url)
    tunnel = await client.post(api_url, json=body, headers=headers, timeout=None)
    song = tunnel.json()
    
    wave = None
    sr = None
    if song['status'] == 'tunnel':
        try:
            wave, sr = read_tunnel(song['url'], 'WAV')
        except:
            return None
    else:
        print(song)
        return None
    result = AudioWrapper(data=wave, sr=sr, name=song['filename'])
    return result

async def process_song(song: AudioWrapper):
    song.split()
    song.analyze()
    song.analyze_tempocnn()
    
@app.post("/")
async def process_songs(songs: Songs):
    url = getenv('COBALT_URL')
    async with httpx.AsyncClient() as client:
        song1 = asyncio.create_task(read_song(songs.url1, client, url))
        song2 = asyncio.create_task(read_song(songs.url2, client, url))

        song1, song2 = await asyncio.gather(song1, song2)
        retries = 0
        while (song1 == None or song2 == None) and retries < 5:
            retries += 1
            #retry loop
            tasks = [0, 0]
            if song1 == None:
                tasks[0] = asyncio.create_task(read_song(songs.url1, client, url))
            if song2 == None:
                tasks[1] = asyncio.create_task(read_song(songs.url2, client, url))
            if tasks[0] != 0:
                song1 = await tasks[0]
            if tasks[1] != 0:
                song2 = await tasks[1]
        if song1 == None or song2 == None:
            return {"error":"YouTube API rejected our requests. Try again at a later time or in incognito mode."}
            
        proc1 = asyncio.create_task(process_song(song1))
        proc2 = asyncio.create_task(process_song(song2))
        await asyncio.gather(proc1, proc2)
        song1.stretch_to_other(song2)
        merge_songs(song1, song2)
        
        result = ((np.transpose((song1.instrumental/2) + (song2.vocals/2)))*32768.0).astype(np.int16)
        # print(type(song1.vocals))
        buf = io.BytesIO()
        sf.write(buf, result, song1.sr, format='WAV', subtype='PCM_16')
        buf.seek(0)
        # Pitch stretch
        # Mix
        # Output stems to S3 and save to database
        return StreamingResponse(buf, media_type="audio/wav")

@app.get('/')
async def handshake():
    return {"foo": "bar"}