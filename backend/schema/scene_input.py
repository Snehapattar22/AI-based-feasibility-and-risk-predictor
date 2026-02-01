from pydantic import BaseModel

class SceneInput(BaseModel):
    scene_text: str
