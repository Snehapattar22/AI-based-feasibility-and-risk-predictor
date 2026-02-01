from typing import Dict, List


def generate_motion_paths(scene_text: str):
    # Simple heuristic path generation
    actor_path = [
        [0, 0],
        [10, 5],
        [20, 10],
        [30, 15],
        [40, 20],
        [50, 25],
    ]

    camera_path = [
        [-10, -5],
        [0, 0],
        [10, 5],
        [20, 8],
        [30, 10],
    ]

    return {
        "actor_path": actor_path,
        "camera_path": camera_path
    }

