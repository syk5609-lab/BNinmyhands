---
name: bn-frontend-rebuild
description: Use when changing BNinmyhands frontend UI or UX surfaces such as dashboard, detail, auth, community-lite, sponsor slots, or global shell. Applies to presentation-layer redesigns that must preserve same-run context, persisted-run behavior, disclaimers, and business rules. Do not use for backend-only work or scoring/data-contract changes.
---

# BNinmyhands Frontend Rebuild Workflow

## Purpose
This skill helps Codex rebuild BNinmyhands frontend surfaces without drifting into generic dashboard design or breaking product trust constraints.

## Always do first
1. Read `AGENTS.md`.
2. Read `design-system/MASTER.md`.
3. If working on a specific page, read `design-system/pages/<page>.md` when it exists.
4. Identify affected files and classify them:
   - presentation-only
   - logic-sensitive
5. Write a short plan before major edits.

## Product constraints to preserve
- same-run context is sacred
- dashboard to detail run continuity must stay intact
- persisted-run behavior must not change
- disclaimer and policy entry points must remain visible
- Sponsored surfaces must not impersonate product analysis
- community must remain interpretation support, not a general social feed

## Default design direction
For app UI, prefer:
- calm surface hierarchy
- strong typography and spacing
- few colors
- dense but readable information
- minimal chrome
- table/list/workspace first
- utility copy over marketing copy
- cards only when the card is the interaction

Avoid:
- dashboard-card mosaics
- thick borders on every region
- ornamental gradients in routine product UI
- generic SaaS or startup hero language inside app screens
- bloated headers that consume the first viewport

## Page priorities
### Dashboard
Optimize in this order:
1. shell
2. header
3. run context strip
4. preset row
5. top highlights
6. bucket summary
7. rankings table
8. sponsor slots

Goal: the first viewport should read as one working composition, and the rankings area should feel like the main workspace.

### Detail
Optimize in this order:
1. symbol header and run context
2. score cards
3. latest + delta
4. why this coin
5. funding context
6. history
7. discussion
8. sponsor slot

Goal: detail should read as a same-run analysis surface, not a stack of unrelated cards.

### Auth
Keep auth short, functional, and secondary to the analysis product.

### Community
Keep discussion compact and coin-contextual.
No general social-product affordances unless explicitly required.

### Ads
Mandatory Sponsored label.
Clear visual separation from analysis blocks.
Off state must not destabilize layout.

## Implementation policy
- Prefer the smallest defensible presentation-layer change set.
- Keep unrelated files untouched.
- Remove stale/duplicate UI files when they are causing runtime confusion.
- Move fragile responsive behavior into explicit layout rules when needed.
- Do not introduce visual changes that require backend coupling unless explicitly requested.

## Validation policy
For meaningful UI changes, run:
- lint
- build
- responsive verification on desktop and mobile
- basic flow verification for the changed surface

If layout changed, explicitly check first viewport composition.

## Response format
When finishing, return:
1. concise verification report
2. changed files only
3. remaining risks
4. next step recommendation limited to launch-v1 scope
