from diffusers import StableDiffusionPipeline
import torch
import uuid
import os

os.makedirs("static", exist_ok=True)

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32
)
pipe = pipe.to("cpu")  # CPU safe


def clip_safe_prompt(prompt: str, max_words: int = 60) -> str:
    words = prompt.split()
    return " ".join(words[:max_words])


def build_scene_preview_prompt(scene_text: str, safety: dict) -> str:
    actor_safety = ", ".join(safety.get("actors", [])) or "safety harness, protective clothing"
    camera_safety = ", ".join(safety.get("camera_crew", [])) or "camera crew behind safety barriers"

    return f"""
photorealistic live-action film scene,
real human actors, natural skin texture,
realistic body proportions, realistic physics,
cinematic lighting, professional film camera,
35mm lens, shallow depth of field,
natural motion blur, realistic shadows,

Scene:
{scene_text}

Safety details:
- Actors using: {actor_safety}
- Camera crew safety: {camera_safety}

Composition:
- Actors placed naturally in the environment
- Camera positioned safely away from action
- Clear separation between action and filming zone
- Environment matches real-world scale

Style:
photorealistic, live-action movie frame,
documentary realism, film still,
NOT cartoon, NOT illustration, NOT CGI
"""





def generate_scene_image(scene_text: str, safety: dict) -> str:
    prompt = build_scene_preview_prompt(scene_text, safety)
    safe_prompt = clip_safe_prompt(prompt)

    image = pipe(
        safe_prompt,
        num_inference_steps=15,
        guidance_scale=7.0
    ).images[0]

    filename = f"scene_{uuid.uuid4().hex}.png"
    path = os.path.join("static", filename)

    image.save(path)
    return path
