import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch

# Load environment variables from the .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the SERP API key securely from environment variables
SERP_API_KEY = os.getenv("SERP_API_KEY")
if not SERP_API_KEY:
    raise Exception("SERP_API_KEY must be set in the environment variables.")

# Models for input validation
class SongPayload(BaseModel):
    officialSong: str
    artist: str

class SearchTwoPayload(BaseModel):
    song1: SongPayload
    song2: SongPayload

class TwoSongsResponse(BaseModel):
    link1: str
    link2: str

@app.post("/search_two", response_model=TwoSongsResponse)
def search_two_songs(payload: SearchTwoPayload):
    # Extract and validate song details.
    song1_title = payload.song1.officialSong.strip()
    song1_artist = payload.song1.artist.strip()
    song2_title = payload.song2.officialSong.strip()
    song2_artist = payload.song2.artist.strip()
    
    if not song1_title or not song1_artist or not song2_title or not song2_artist:
        raise HTTPException(status_code=400, detail="Both song1 and song2 must include an officialSong and artist")
    
    # Process song1 using both the official song title and artist.
    params1 = {
        "engine": "youtube",
        "search_query": f"{song1_title} {song1_artist} audio",
        "api_key": SERP_API_KEY,
    }
    search1 = GoogleSearch(params1)
    results1 = search1.get_dict()
    video_results1 = results1.get("video_results")
    if not video_results1:
        raise HTTPException(status_code=404, detail=f"No video results found for song1: {song1_title} {song1_artist}")
    link1 = video_results1[0].get("link")
    
    # Process song2 using both the official song title and artist.
    params2 = {
        "engine": "youtube",
        "search_query": f"{song2_title} {song2_artist} audio",
        "api_key": SERP_API_KEY,
    }
    search2 = GoogleSearch(params2)
    results2 = search2.get_dict()
    video_results2 = results2.get("video_results")
    if not video_results2:
        raise HTTPException(status_code=404, detail=f"No video results found for song2: {song2_title} {song2_artist}")
    link2 = video_results2[0].get("link")
    
    return TwoSongsResponse(link1=link1, link2=link2)
