import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
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


def ai_scene_analysis(scene_text: str):

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

        return {
            "risk_factors": ["AI parsing failed — manual review required"],
            "risk_level": "Medium",
            "role_based_risks": {
                "actors": [],
                "camera_crew": [],
                "technicians": [],
                "director": []
            },
            "safety_instructions": {
                "actors": ["Manual safety briefing required"],
                "camera_crew": [],
                "technicians": [],
                "director": []
            }
        }
