from pydantic import BaseModel
from typing import Any, List, Dict


class SceneOutput(BaseModel):
    risk_factors: List[str]
    risk_level: str
    role_based_risks: Dict[str, List[str]]
    safety_instructions: Dict[str, List[str]]
    feasibility: str
    motion_paths: Dict[str, Any]
    collision_report: Dict[str, Any]