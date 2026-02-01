def decide_feasibility(level: str) -> str:
    """
    Converts risk level into production feasibility decision.
    """

    if level == "High":
        return "Modified"

    elif level == "Medium":
        return "Approved with Conditions"

    return "Approved"
