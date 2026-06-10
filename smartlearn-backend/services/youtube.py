import os
import json
import httpx
import logging
from functools import lru_cache
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@lru_cache(maxsize=100)
def check_if_educational(query: str) -> str:
    """Uses LLM to decide if a query needs YouTube videos and generates the search term."""
    prompt = f"""
    You are an intelligent routing agent for an educational platform.
    Analyze the following user query: "{query}"
    
    Determine if this query is a complex, educational topic that would highly benefit from YouTube video tutorials (e.g., programming concepts, science, history, math, deep explanations).
    DO NOT recommend videos for simple greetings, casual chat, quick definitions, or highly specific personal questions.
    
    Respond STRICTLY in JSON format:
    {{"is_educational": boolean, "search_query": "optimal youtube search string or null"}}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error checking educational value: {e}")
        return '{"is_educational": false, "search_query": null}'

async def fetch_youtube_videos(query: str):
    """Fetches videos from YouTube Data API v3."""
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    if not YOUTUBE_API_KEY:
        logger.warning("YouTube API key is missing. Please add YOUTUBE_API_KEY to .env")
        return []
        
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 3,
        "key": YOUTUBE_API_KEY,
        "relevanceLanguage": "en"
    }
    
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            videos = []
            for item in data.get("items", []):
                # Safely decode HTML entities in title
                title = item["snippet"]["title"]
                videos.append({
                    "id": item["id"]["videoId"],
                    "title": title,
                    "channel": item["snippet"]["channelTitle"],
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
                })
            return videos
        except Exception as e:
            logger.error(f"YouTube API Error: {e}")
            return []

async def get_youtube_recommendations(user_query: str):
    """Main orchestration function."""
    decision_json = check_if_educational(user_query)
    
    try:
        decision = json.loads(decision_json)
        if decision.get("is_educational") and decision.get("search_query"):
            return await fetch_youtube_videos(decision["search_query"])
    except json.JSONDecodeError:
        pass
        
    return []
