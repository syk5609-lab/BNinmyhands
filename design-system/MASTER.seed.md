# BNinmyhands Design System Seed

> This is a seed file. Refine it into `design-system/MASTER.md` before large UI changes.

## Product framing
BNinmyhands is a trust-centered derivatives candidate dashboard.
It helps users narrow today’s worth-watching futures symbols and explains why via score buckets, deltas, history, and funding-aware interpretation.

## Audience
- intermediate traders
- research-oriented users
- users already familiar with OI / funding / taker flow / long-short context

## Core UI principles
1. Same-run context must stay visible and understandable.
2. Trust beats novelty.
3. Dense is fine; confusing is not.
4. Primary surfaces should feel operational, not promotional.
5. Disclosure must be obvious but not noisy.
6. Community supports interpretation; it does not become the product.

## Tone
- analytical
- calm
- precise
- low-hype
- research-forward

## Copy rules
Use utility copy, not marketing copy.
Prefer:
- clear labels
- one-sentence support text
- freshness/scope/value language
- “what it is / what to do / what changed” framing

Avoid:
- aspirational hero copy
- “unlock alpha” style hype
- campaign slogans on product surfaces
- certainty language that sounds like financial advice

## Layout model
### Desktop
Default mental model:
- top nav / header
- primary workspace
- secondary contextual sections below or beside the workspace

Do not over-card the layout.
Use sections, dividers, aligned columns, and table structure before adding card frames.

### Tablet
Preserve hierarchy, not exact density.

### Mobile
Stack intentionally.
Keep run context, symbol/status, and key actions above the fold.

## Surface hierarchy
1. navigation + global status
2. run context / freshness / preset context
3. primary analysis surface
4. supporting interpretation blocks
5. community / sponsor / secondary utilities

## Color direction
Keep color count low.
Use one primary accent plus semantic status colors.

Suggested neutral family:
- page bg: very dark graphite or deep slate
- surface bg: slightly raised charcoal/slate
- text primary: near-white with soft warmth
- text secondary: cool muted gray
- divider: low-contrast graphite line

Suggested accent family:
- primary accent: restrained cyan / blue-cyan for active state and important links
- positive semantic: muted green
- negative semantic: muted red
- warning semantic: amber
- info semantic: desaturated blue

Funding / risk colors must remain readable and not dominate the whole page.

## Typography
Suggested pair:
- Primary UI font: IBM Plex Sans or Geist Sans
- Numeric / data font: IBM Plex Mono or JetBrains Mono

Rules:
- clear hierarchy
- data labels smaller but still readable
- numbers align and scan cleanly
- mono font only where it improves comparison or trust

## Spacing
Prefer a restrained spacing scale.
Aim for compact density with clear grouping.
Use whitespace to separate logic blocks before using borders.

## Borders / radius / shadows
- low-contrast borders only when needed
- moderate radius, not overly soft
- minimal shadows
- surface separation should come mostly from layout and tone, not heavy effects

## Component rules
### Header
- compact
- product identity visible
- avoid oversized chrome
- run freshness or environment status may sit nearby if helpful

### Run context strip
- must clearly communicate run freshness / run identity / current preset context
- compact, scan-friendly, not decorative

### Preset row
- readable labels
- short explanation copy
- clearly interactive
- avoid toy-like card treatment

### Top highlights
- interpretive summary, not vanity KPI strip
- should support decision-making fast

### Bucket summary
- visually secondary to the table/workspace
- should make bucket logic legible at a glance

### Rankings table
- primary workspace
- optimize for scanning and comparison
- align numeric columns cleanly
- avoid excessive badges and micro-cards inside cells

### Score cards
- compact and comparable
- emphasize meaning, not ornament

### Funding context block
- treat as explanatory analysis
- latest, absolute, bias, and interpretation should read as one coherent story

### History block
- should help validate recency/change, not add visual clutter

### Discussion block
- compact, readable, clearly subordinate to analysis
- write affordances obvious for signed-in users
- guest gating should feel calm and predictable

### Sponsor slot
- must be clearly Sponsored
- visually separate from analysis sections
- should feel like a contained insert, not a native analysis card

## State design
### Loading
- calm skeletons
- preserve layout shape

### Empty
- explain absence in one sentence
- suggest next action only if helpful

### Error
- concise explanation
- retry or fallback if meaningful

### Unavailable
- friendly, context-aware, and trust-preserving
- explain when same-run context is missing or invalid

### Degraded
- global/surface banner when freshness or scheduler issues matter
- informative, not alarming

## Disclosure rules
### Disclaimer
Must remain accessible from dashboard, detail, and community entry points.
Use stable, non-hype language.

### Sponsored
Always visibly labeled.
Never rely on subtle styling alone.

### Community intro
Frame as analysis-support discussion, not investment advice or a generic forum.
