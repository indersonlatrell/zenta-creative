---
name: zenta-ad-image-prompts
description: Create, validate, store, retrieve, and render expert JSON image prompts for Zenta Creative paid ads and organic social posts. Use when asked for Zenta ad images, image-ad prompts, promotional post concepts, social image prompts, creative variants, a JSON prompt library, Google Drive prompt storage, or when a saved Zenta prompt should be sent to ChatGPT image generation.
---

# Zenta Ad Image Prompts

Create campaign-ready image concepts grounded in the installed `ads` and
`ads-creative` workflows. Keep creative hypotheses, platform compliance, and
measured performance separate.

## Load References

1. Read `references/zenta-brand-profile.json` for approved brand and offer facts.
2. Read `references/prompt-library.schema.json` before producing or editing JSON.
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
7. Include a complete provider-neutral `generation_prompt`, exact overlay copy,
   negative constraints, alt text, claim review, and production notes.
8. Treat every output as a human-review draft, never as proof of performance or
   authorization to publish.

## JSON Contract

Return valid JSON only when the user asks for prompts. Do not wrap it in Markdown.
Use schema version `1.0.0` and the structure in
`references/prompt-library.schema.json`.

Every item must include:

- stable `prompt_id` and `content_type`;
- campaign context and creative strategy;
- format intent with platform-preview status;
- visual direction and exact `generation_prompt`;
- overlay, caption, CTA, and `render_text_in_image` decision;
- negative constraints, accessibility, compliance, and production review.

Write the JSON to a local file and run:

```bash
python3 scripts/validate_prompt_library.py path/to/library.json
```

Do not store or upload invalid JSON.

## Google Drive Library

Use the connected Google Drive tools. The canonical folder name is
`Zenta Creative - Ad Image Prompt Library`.

For storage:

1. Resolve the folder ID from `references/storage.json`, then verify its metadata.
   If it is unavailable, search for the exact folder name and confirm its folder MIME type.
2. Create it in My Drive only if no exact folder exists.
3. Name files `YYYY-MM-DD__campaign-slug__vNN.json`.
4. Upload the validated JSON to that folder.
5. Read back file metadata and retain the observed folder and file IDs.
6. Never overwrite an existing library silently; create a new version.

For retrieval:

1. Search or list the canonical folder.
2. Select the requested campaign, service, locale, or `prompt_id`.
3. Fetch the JSON and validate it before use.
4. If several prompts match, show concise IDs and concepts for selection.

## Image Generation Handoff

When the user asks to generate a saved prompt:

1. Retrieve and validate the selected Drive JSON.
2. Confirm the exact `prompt_id`; infer it only when one match exists.
3. Load the `imagegen` skill.
4. Send `generation_prompt` to ChatGPT image generation. Include approved
   reference images only when attached or available by valid local path.
5. Generate one draft unless the user requests a batch.
6. Do not imply the result is platform-approved or ready to publish. The JSON's
   human review, crop preview, text, logo, claim, and accessibility checks remain.

Do not send confidential client data, customer lists, credentials, private ad
exports, or unapproved likenesses to image generation or Google Drive.
