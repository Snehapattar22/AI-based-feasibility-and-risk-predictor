import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

HF_MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "stabilityai/stable-diffusion-2"
)


def clean_prompt(scene_text: str) -> str:
    """
    Make prompt safe so HuggingFace does not reject it
    """
    banned_words = [
        "attack", "explosion", "fire", "gun",
        "kill", "bomb", "terror", "shoot"
    ]

    text = scene_text.lower()
    for word in banned_words:
        text = text.replace(word, "dramatic action")

    return (
        "cinematic movie still, dramatic rescue scene, "
        "realistic lighting, high detail, " + text
    )


def generate_scene_image(scene_text: str):

    prompt = clean_prompt(scene_text)

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}"
    }

    payload = {
        "inputs": prompt,
        "options": {"wait_for_model": True}
    }

    response = requests.post(
        HF_MODEL_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code == 200:
        return response.content  # image bytes

    print("HF IMAGE ERROR:", response.text)
    return None
