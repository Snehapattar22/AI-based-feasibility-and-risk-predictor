from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil
import os

# Schemas
from schema.scene_input import SceneInput
from schema.scene_output import SceneOutput

# Core engines
from app.ai_engine import ai_scene_analysis
from engine.feasibility import decide_feasibility
from engine.image_generator import generate_scene_image

# Utils
from utils.pdf_reader import extract_text_from_pdf
from engine.motion_model import generate_motion_paths
from engine.collision import detect_collisions

router = APIRouter()


# =========================
# TEXT SCENE ANALYSIS
# =========================
@router.post("/analyze-scene", response_model=SceneOutput)
def analyze_scene(req: SceneInput):

    ai_data = ai_scene_analysis(req.scene_text) or {}

    risk_factors = ai_data.get("risk_factors", [])
    risk_level = ai_data.get("risk_level", "Medium")
    role_based = ai_data.get("role_based_risks", {})
    safety = ai_data.get("safety_instructions", {})

    feasibility = decide_feasibility(risk_level)
    motion = generate_motion_paths(req.scene_text)

    collision_report = detect_collisions(
        motion["actor_path"],
        motion["camera_path"]
)

    return SceneOutput(
        risk_factors=risk_factors,
        risk_level=risk_level,
        role_based_risks=role_based,
        safety_instructions=safety,
        feasibility=feasibility,
        motion_paths=motion,
        collision_report=collision_report
    )
    



# =========================
# PDF SCRIPT ANALYSIS
# =========================
@router.post("/analyze-pdf", response_model=SceneOutput)
async def analyze_pdf(file: UploadFile = File(...)):

    temp_path = f"temp_{file.filename}"

    try:
        # Save uploaded PDF
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        script_text = extract_text_from_pdf(temp_path)

        ai_data = ai_scene_analysis(script_text) or {}

        risk_level = ai_data.get("risk_level", "Medium")
        feasibility = decide_feasibility(risk_level)

        return SceneOutput(
            risk_factors=ai_data.get("risk_factors", []),
            risk_level=risk_level,
            role_based_risks=ai_data.get("role_based_risks", {}),
            safety_instructions=ai_data.get("safety_instructions", {}),
            feasibility=feasibility
        )

    finally:
        # Always clean temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


# =========================
# IMAGE GENERATION
# =========================
class ImageRequest(BaseModel):
    scene_text: str


@router.post("/generate-image")
def generate_image(req: ImageRequest):

    ai_data = ai_scene_analysis(req.scene_text) or {}
    safety = ai_data.get("safety_instructions", {})

    image_path = generate_scene_image(req.scene_text, safety)

    return FileResponse(
        image_path,
        media_type="image/png",
        filename="scene_preview.png"
    )

