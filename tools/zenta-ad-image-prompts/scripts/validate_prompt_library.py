#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path


TOP_LEVEL_KEYS = {
    "schema_version",
    "library_id",
    "brand",
    "created_at",
    "status",
    "assumptions",
    "prompts",
}

PROMPT_KEYS = {
    "prompt_id",
    "content_type",
    "campaign",
    "creative_strategy",
    "format",
    "visual_direction",
    "copy",
    "generation_prompt",
    "negative_constraints",
    "accessibility",
    "compliance",
    "production",
}

REQUIRED_NESTED = {
    "campaign": {
        "objective",
        "conversion",
        "service_id",
        "audience",
        "funnel_stage",
        "platforms",
        "placements",
        "geography",
        "language",
    },
    "creative_strategy": {
        "concept_name",
        "audience_insight",
        "message_angle",
        "framework",
        "hook",
        "hypothesis",
    },
    "format": {"aspect_ratio", "orientation", "spec_status", "crop_guidance"},
    "visual_direction": {
        "subject",
        "action",
        "environment",
        "composition",
        "lighting",
        "palette",
        "style",
    },
    "copy": {"overlay_headline", "overlay_support", "cta", "caption"},
    "accessibility": {"alt_text", "contrast_note"},
    "compliance": {"claim_risk", "required_review"},
    "production": {
        "render_text_in_image",
        "logo_instruction",
        "human_review_required",
        "generation_status",
    },
}


def fail(message):
    raise ValueError(message)


def require_exact_keys(value, expected, location):
    if not isinstance(value, dict):
        fail(f"{location} must be an object")
    missing = expected - value.keys()
    extra = value.keys() - expected
    if missing:
        fail(f"{location} missing keys: {', '.join(sorted(missing))}")
    if extra:
        fail(f"{location} has unsupported keys: {', '.join(sorted(extra))}")


def validate(path):
    with path.open(encoding="utf-8") as handle:
        library = json.load(handle)

    require_exact_keys(library, TOP_LEVEL_KEYS, "library")
    if library["schema_version"] != "1.0.0":
        fail("schema_version must be 1.0.0")
    if library["brand"] != "Zenta Creative":
        fail("brand must be Zenta Creative")
    if library["status"] not in {"draft_for_human_review", "approved_for_generation"}:
        fail("invalid library status")
    if not isinstance(library["prompts"], list) or not library["prompts"]:
        fail("prompts must be a non-empty array")

    seen = set()
    for index, prompt in enumerate(library["prompts"]):
        location = f"prompts[{index}]"
        require_exact_keys(prompt, PROMPT_KEYS, location)
        prompt_id = prompt["prompt_id"]
        if not isinstance(prompt_id, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", prompt_id):
            fail(f"{location}.prompt_id is invalid")
        if prompt_id in seen:
            fail(f"duplicate prompt_id: {prompt_id}")
        seen.add(prompt_id)

        if prompt["content_type"] not in {"paid_ad_image", "organic_image_post"}:
            fail(f"{location}.content_type is invalid")
        for key, expected in REQUIRED_NESTED.items():
            require_exact_keys(prompt[key], expected, f"{location}.{key}")
        if len(prompt["generation_prompt"]) < 120:
            fail(f"{location}.generation_prompt is too short")
        if len(prompt["negative_constraints"]) < 3:
            fail(f"{location}.negative_constraints needs at least three items")
        if prompt["production"]["human_review_required"] is not True:
            fail(f"{location}.production.human_review_required must be true")

    return len(library["prompts"])


def main():
    if len(sys.argv) != 2:
        print("usage: validate_prompt_library.py LIBRARY.json", file=sys.stderr)
        return 2
    try:
        count = validate(Path(sys.argv[1]))
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"INVALID: {error}", file=sys.stderr)
        return 1
    print(f"VALID: {count} prompts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
