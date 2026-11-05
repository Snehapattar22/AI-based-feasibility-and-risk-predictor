import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

client = None
if api_key:
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )


def extract_json(text: str):
    """
    Safely extract JSON block from Groq response
    even if extra text exists.
    """
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("No JSON found in response")


def heuristic_scene_analysis(scene_text: str):
    lowered = (scene_text or "").lower()
    risk_factors = []

    if any(term in lowered for term in ["explosion", "fire", "hazard", "heavy machinery", "stunt", "falling", "crowd", "vehicle", "knife", "weapon", "high speed"]):
        risk_factors.append("High-energy action or hazard exposure detected")
    if any(term in lowered for term in ["wet", "slippery", "cables", "stairs", "hole", "narrow", "dark"]):
        risk_factors.append("Environmental hazards may reduce safe access and visibility")
    if any(term in lowered for term in ["camera", "actor", "crew", "technician", "close", "crowd", "tracking"]):
        risk_factors.append("Crew movement patterns require clear spacing and pre-checks")

    if not risk_factors:
        risk_factors = ["Routine production activity with standard safety control requirements"]

    if any(term in lowered for term in ["explosion", "fire", "stunt", "vehicle", "weapon", "falling", "crowd"]):
        risk_level = "High"
    elif any(term in lowered for term in ["camera", "moving", "narrow", "wet", "crowd", "stairs", "cables"]):
        risk_level = "Medium"
    else:
        risk_level = "Low"

    role_based_risks = {
        "actors": ["Check stunt clearance and safe blocking before action starts."],
        "camera_crew": ["Maintain safe sightline distance from moving talent and hazards."],
        "technicians": ["Confirm cable routing, power safety, and access lane clearance."],
        "director": ["Review shot coverage plan for safe spacing and emergency escape routes."]
    }

    safety_instructions = {
        "actors": ["Use approved stunt choreography and safety briefing before rehearsal."],
        "camera_crew": ["Keep a clear line of movement and avoid obstructing the action zone."],
        "technicians": ["Inspect equipment, power lines, and floor markings before the take."],
        "director": ["Authorise only approved blocking, safety reset points, and contingency action."]
    }

    return {
        "risk_factors": risk_factors,
        "risk_level": risk_level,
        "role_based_risks": role_based_risks,
        "safety_instructions": safety_instructions,
    }


def ai_scene_analysis(scene_text: str):
    if not client:
        return heuristic_scene_analysis(scene_text)

    prompt = f"""
You are a professional film safety risk analyzer.

Analyze this scene:

"{scene_text}"

IMPORTANT RULES:
- Respond with JSON ONLY
- No explanation
- No extra text
- No markdown
- Only JSON object

Format:

{{
  "risk_factors": ["risk1", "risk2"],
  "risk_level": "Low | Medium | High",

  "role_based_risks": {{
    "actors": ["..."],
    "camera_crew": ["..."],
    "technicians": ["..."],
    "director": ["..."]
  }},

  "safety_instructions": {{
    "actors": ["..."],
    "camera_crew": ["..."],
    "technicians": ["..."],
    "director": ["..."]
  }}
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        text = response.choices[0].message.content.strip()
        data = extract_json(text)
        return data

    except Exception as e:
        print("Groq ERROR:", e)
        return heuristic_scene_analysis(scene_text)
