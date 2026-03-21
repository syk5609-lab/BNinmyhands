# BNinmyhands Project Instructions

## Source of truth
Use these in this priority order for product/UI decisions:
1. BNinmyhands PDR v2.0
2. System & Data Spec v1.0
3. Trust / Community / Ads Policy v1.0
4. Launch Plan & QA Playbook v1.0
5. design-system/MASTER.md
6. design-system/pages/*.md
7. Figma and screenshots as visual reference only

## What this product is
BNinmyhands is a trust-centered derivatives candidate dashboard.
It narrows today’s worth-watching coins and explains why using same-run context, score buckets, tags, history, and funding-aware interpretation.
It also includes minimal auth, community-lite discussion, and clearly disclosed sponsor slots.

## Non-negotiables
- same-run context is sacred
- do not break persisted-run behavior
- do not break dashboard -> detail run_id continuity
- do not remove disclaimer/policy entry points
- do not let ads visually impersonate analysis content
- do not let community feel like a generic social product

## Scope guardrail
When changing frontend code, prefer presentation-layer changes only:
- layout
- shell
- typography
- spacing
- visual hierarchy
- cards/tables/sections
- loading/empty/error/unavailable/degraded states

Do not rewrite or destabilize:
- routes
- API/data contracts
- scoring logic
- auth/community/ads business rules
- persisted-run logic

## UX style
For product surfaces, default to:
- calm surface hierarchy
- strong typography and spacing
- few colors
- dense but readable information
- minimal chrome
- utility copy over marketing copy
- cardless layout where possible

Avoid:
- dashboard-card mosaics
- thick borders everywhere
- decorative gradients in routine product UI
- generic SaaS hero language in app surfaces
- overuse of pills/badges without scanning value

## Surface-specific notes
### Dashboard
Treat as a primary workspace.
The table/rankings area is the main surface.
Preset, highlights, and buckets support the workspace; they do not overshadow it.

### Detail
Treat as a same-run analysis surface.
Funding context is explanatory context, not decorative metadata.
Discussion sits below the analysis.

### Community
Community is coin-interpretation support only.
Do not design it like a generic feed product.

### Ads
Sponsored label is mandatory.
Ad slots must remain obviously separate from analysis sections.
Layout must not break when slot is off.

## Validation
For meaningful UI changes, validate at least:
- lint
- build
- desktop viewport
- mobile viewport
- dashboard -> detail -> back flow
- guest/write gating where relevant

If a change affects shell/layout, check first viewport composition explicitly.

## FRONTEND RESET MODE

- Legacy dashboard/detail presentation is frozen.
- V2 and V3 previews are reference-only and must not be iterated on.
- Do not patch old presentation files.
- Do not port Figma Make code.
- Use UI UX PRO MAX first to generate the rebuild design system.
- Build a brand-new presentation layer from scratch.
- Preserve only runtime logic, routes, data contracts, persisted-run behavior, auth rules, ads rules, and community rules.
- Use fixture-first preview routes before any runtime adapters.
- No duplicate top branding/sign-in rows.
- Dashboard must read as a primary working surface.
- Rankings table must feel like the main workspace.
- Detail must read as one same-run analysis story.
- Sponsored areas must stay clearly separate.
- Ads-off states must preserve layout stability.