---
name: zenta-ad-image-prompts
description: Create, validate, store, and retrieve expert JSON image prompts for Zenta Creative paid ads and organic social posts. Use when asked for Zenta image-ad prompts, promotional post concepts, social image prompts, creative variants, separate JSON prompt files, or Google Drive prompt storage. This skill produces prompt files only and never generates images.
---

# Zenta Ad Image Prompts

Create campaign-ready image concepts grounded in the installed `ads` and
`ads-creative` workflows. Keep creative hypotheses, platform compliance, and
measured performance separate.

## Load References

1. Read `references/zenta-brand-profile.json` for approved brand and offer facts.
2. Read `references/prompt.schema.json` before producing or editing JSON.
3. Read `references/storage.json` for the canonical Google Drive folder.
4. Load the installed `ads` thinking framework and `ads-creative` skill for
   creative production or review.
5. Load only the current platform-specific creative reference needed for the
   requested placement. Treat dimensions, safe zones, overlays, and eligibility
   as volatile. Mark them `needs_platform_preview` when not currently verified.

## Intake

Extract from the request and known Zenta profile:

- objective and primary conversion;
- service or approved offer;
- audience, geography, language, and funnel stage;
- platform, placement, content type, and intended ratio;
- proof, claims, destination, CTA, and available brand assets;
- number of concepts and whether text should be rendered in the image.

Ask only when a missing field would make the output misleading. Otherwise state
the assumption in `library.assumptions` and continue with a draft.

## Generate

1. Define one audience insight and one testable hypothesis per concept.
2. Make concepts materially different in message angle, subject, composition,
   and emotional mechanism. A crop or color change is not a new concept.
3. Connect every visual to an approved service truth. Never fabricate clients,
   testimonials, rankings, dashboards, results, urgency, scarcity, or guarantees.
4. Use Suriname context naturally without stereotypes or invented landmarks.
5. Keep the primary subject, promise, brand cue, and required disclosure legible
   across likely crops. Require account preview before publication.
6. Prefer one short overlay headline and one CTA. Put detailed copy in the post
   caption, not into tiny generated typography.
7. Include a complete provider-neutral `image_prompt`, exact overlay copy,
   negative constraints, alt text, claim review, and production notes.
8. Treat every output as a human-review draft, never as proof of performance or
   authorization to publish.

## JSON Contract

Return valid JSON only when the user asks for prompts. Do not wrap it in Markdown.
Use schema version `2.0.0` and the structure in `references/prompt.schema.json`.
Create exactly one prompt object per file. Never place multiple prompts in an array.

Every item must include:

- stable `prompt_id` and `content_type`;
- campaign context and creative strategy;
- format intent with platform-preview status;
- visual direction and exact `image_prompt`;
- overlay, caption, CTA, and typography-production decision;
- negative constraints, accessibility, compliance, and production review.

Write the JSON to a local file and run:

```bash
python3 scripts/validate_prompt.py path/to/prompt.json
python3 scripts/validate_prompt.py references/prompts
```

Do not store or upload invalid JSON.

## Google Drive Library

Use the connected Google Drive tools. The canonical folder name is
`Zenta Creative - Ad Image Prompt Library`.

For storage:

1. Resolve the folder ID from `references/storage.json`, then verify its metadata.
   If it is unavailable, search for the exact folder name and confirm its folder MIME type.
2. Create it in My Drive only if no exact folder exists.
3. Store individual prompt files in the Drive child folder named `Individual Prompts`.
4. Name files `<prompt-id>.json`; every file must contain that same `prompt_id`.
5. Upload each validated JSON as its own Drive file.
6. Read back file metadata and retain the observed folder and file IDs.
7. Never overwrite an existing prompt silently; create a versioned prompt ID.

For retrieval:

1. Search or list the canonical folder.
2. Select the requested campaign, service, locale, or `prompt_id`.
3. Fetch the individual JSON file and validate it before use.
4. If several prompts match, show concise IDs and concepts for selection.

## Prompt-Only Boundary

Never call an image-generation tool. Never generate, edit, or render an image.
Return or retrieve the requested JSON prompt file only. Keep official logos and
wordmarks out of `image_prompt`; reserve clean space so approved brand assets and
exact copy can be added during final design production.

Do not store confidential client data, customer lists, credentials, private ad
exports, or unapproved likenesses in prompt files or Google Drive.
