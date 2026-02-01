from typing import List, Tuple, Dict
import math


def distance(p1: Tuple[int, int], p2: Tuple[int, int]) -> float:
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


def detect_collisions(
    actor_path: List[Tuple[int, int]],
    camera_path: List[Tuple[int, int]]
) -> Dict:
    """
    Detects possible collisions and safety hazards.
    """

    collisions = []

    # --- Rule 1: Actor too close to camera ---
    for a in actor_path:
        for c in camera_path:
            if distance(a, c) < 15:
                collisions.append("Actor too close to camera crew")

    # --- Hazard zones (example) ---
    hazard_zones = [
        {"name": "Fire Zone", "area": ((40, 40), (60, 70))},
        {"name": "Restricted Edge", "area": ((0, 90), (100, 100))}
    ]

    # --- Rule 2: Actor enters hazard zone ---
    for a in actor_path:
        for zone in hazard_zones:
            (x1, y1), (x2, y2) = zone["area"]
            if x1 <= a[0] <= x2 and y1 <= a[1] <= y2:
                collisions.append(f"Actor enters {zone['name']}")

    return {
        "collision_detected": len(collisions) > 0,
        "issues": list(set(collisions))
    }
