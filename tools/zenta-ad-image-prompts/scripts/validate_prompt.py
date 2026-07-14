#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path


TOP_KEYS = {
    "schema_version", "prompt_id", "brand", "created_at", "status",
    "content_type", "assumptions", "campaign", "creative_strategy", "format",
    "visual_direction", "copy", "image_prompt", "negative_constraints",
    "accessibility", "compliance", "production",
}

NESTED_KEYS = {
    "campaign": {"objective", "conversion", "service_id", "audience", "funnel_stage", "platforms", "placements", "geography", "language"},
    "creative_strategy": {"concept_name", "audience_insight", "message_angle", "framework", "hook", "hypothesis"},
    "format": {"aspect_ratio", "orientation", "spec_status", "crop_guidance"},
    "visual_direction": {"subject", "action", "environment", "composition", "lighting", "palette", "style"},
    "copy": {"overlay_headline", "overlay_support", "cta", "caption"},
    "accessibility": {"alt_text", "contrast_note"},
    "compliance": {"claim_risk", "required_review"},
    "production": {"typography_instruction", "logo_instruction", "human_review_required"},
}


def exact_keys(value, expected, location):
    if not isinstance(value, dict):
        raise ValueError(f"{location} must be an object")
    missing = expected - value.keys()
    extra = value.keys() - expected
    if missing:
        raise ValueError(f"{location} missing: {', '.join(sorted(missing))}")
    if extra:
        raise ValueError(f"{location} unsupported: {', '.join(sorted(extra))}")


def validate_file(path):
    with path.open(encoding="utf-8") as handle:
        prompt = json.load(handle)
    exact_keys(prompt, TOP_KEYS, path.name)
    if prompt["schema_version"] != "2.0.0" or prompt["brand"] != "Zenta Creative":
        raise ValueError(f"{path.name} has invalid schema or brand")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", prompt["prompt_id"]):
        raise ValueError(f"{path.name} has invalid prompt_id")
    if path.stem != prompt["prompt_id"]:
        raise ValueError(f"{path.name} must match prompt_id")
    for key, expected in NESTED_KEYS.items():
        exact_keys(prompt[key], expected, f"{path.name}.{key}")
    if len(prompt["image_prompt"]) < 300:
        raise ValueError(f"{path.name}.image_prompt must be at least 300 characters")
    if len(prompt["negative_constraints"]) < 5:
        raise ValueError(f"{path.name} needs at least five negative constraints")
    if prompt["production"]["human_review_required"] is not True:
        raise ValueError(f"{path.name} requires human review")
    if "generate" in prompt["production"]["logo_instruction"].lower():
        raise ValueError(f"{path.name} must not request generated logos")
    return prompt["prompt_id"]


def main():
    if len(sys.argv) != 2:
        print("usage: validate_prompt.py PROMPT.json|DIRECTORY", file=sys.stderr)
        return 2
    target = Path(sys.argv[1])
    paths = sorted(target.glob("*.json")) if target.is_dir() else [target]
    if not paths:
        print("INVALID: no JSON prompt files found", file=sys.stderr)
        return 1
    try:
        ids = [validate_file(path) for path in paths]
        if len(ids) != len(set(ids)):
            raise ValueError("duplicate prompt_id values")
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"INVALID: {error}", file=sys.stderr)
        return 1
    print(f"VALID: {len(ids)} individual prompt files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
