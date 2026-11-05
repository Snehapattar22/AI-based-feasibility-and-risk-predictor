import os
import uuid
from PIL import Image, ImageDraw, ImageFilter

os.makedirs("static", exist_ok=True)


def clip_safe_prompt(prompt: str, max_words: int = 60) -> str:
    words = prompt.split()
    return " ".join(words[:max_words])


def build_scene_preview_prompt(scene_text: str, safety: dict) -> str:
    actor_safety = ", ".join(safety.get("actors", [])) or "safety harness, protective clothing"
    camera_safety = ", ".join(safety.get("camera_crew", [])) or "camera crew behind safety barriers"

    return f"""
Production scene preview
Scene: {scene_text}
Actor safeguards: {actor_safety}
Camera crew safeguards: {camera_safety}
"""


def generate_scene_image(scene_text: str, safety: dict) -> str:
    prompt = build_scene_preview_prompt(scene_text, safety)
    safe_prompt = clip_safe_prompt(prompt)

    width, height = 1200, 800
    image = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(image)

    # Sky / background
    draw.rectangle((0, 0, width, height), fill=(15, 23, 42))
    draw.rectangle((0, height - 200, width, height), fill=(24, 38, 58))

    # Light streaks
    for x in range(50, width, 110):
        draw.rectangle((x, 40, x + 30, 180), fill=(59, 130, 246, 80))

    # Actor and camera silhouettes
    actor_x, actor_y = 240, 430
    camera_x, camera_y = 760, 360

    draw.ellipse((actor_x - 34, actor_y - 56, actor_x + 34, actor_y + 16), fill=(168, 85, 247))
    draw.rectangle((actor_x - 28, actor_y + 16, actor_x + 28, actor_y + 120), fill=(59, 130, 246))
    draw.line((actor_x, actor_y + 18, actor_x - 40, actor_y + 90), fill=(255, 255, 255), width=8)
    draw.line((actor_x, actor_y + 18, actor_x + 48, actor_y + 90), fill=(255, 255, 255), width=8)

    draw.rectangle((camera_x - 70, camera_y - 40, camera_x + 70, camera_y + 50), fill=(251, 146, 60))
    draw.circle((camera_x, camera_y - 80), 26, fill=(248, 250, 252))
    draw.line((camera_x - 40, camera_y + 42, camera_x + 40, camera_y + 42), fill=(255, 255, 255), width=8)

    # Hazard area and path markers
    draw.rounded_rectangle((540, 240, 900, 520), radius=28, outline=(248, 113, 113), width=5)
    draw.text((60, 60), "Scene Preview", fill=(255, 255, 255), font=None)
    draw.text((60, 100), safe_prompt[:100], fill=(203, 213, 225), font=None)

    image = image.filter(ImageFilter.SMOOTH)

    filename = f"scene_{uuid.uuid4().hex}.png"
    path = os.path.join("static", filename)
    image.save(path)
    return path
