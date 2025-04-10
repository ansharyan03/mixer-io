import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
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

class TwoSongsResponse(BaseModel):
    link1: str
    link2: str

@app.post("/search_two", response_model=TwoSongsResponse)
def search_two_songs(payload: dict):
    song1 = payload.get("song1", "").strip()
    song2 = payload.get("song2", "").strip()
    if not song1 or not song2:
        raise HTTPException(status_code=400, detail="Both song1 and song2 are required")
    
    # Process song1
    params1 = {
        "engine": "youtube",
        "search_query": f"{song1} song audio",
        "api_key": SERP_API_KEY,  # Updated here
    }
    search1 = GoogleSearch(params1)
    results1 = search1.get_dict()
    video_results1 = results1.get("video_results")
    if not video_results1:
        raise HTTPException(status_code=404, detail=f"No video results found for song1: {song1}")
    link1 = video_results1[0].get("link")
    
    # Process song2
    params2 = {
        "engine": "youtube",
        "search_query": f"{song2} audio",
        "api_key": SERP_API_KEY,  # Updated here
    }
    search2 = GoogleSearch(params2)
    results2 = search2.get_dict()
    video_results2 = results2.get("video_results")
    if not video_results2:
        raise HTTPException(status_code=404, detail=f"No video results found for song2: {song2}")
    link2 = video_results2[0].get("link")
    
    return TwoSongsResponse(link1=link1, link2=link2)
