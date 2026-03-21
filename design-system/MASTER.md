# BNinmyhands Design System

## Product framing
BNinmyhands is a trust-centered derivatives candidate dashboard.
It helps users narrow today’s worth-watching futures symbols and explains why using same-run context, score buckets, deltas, funding-aware interpretation, and recent history.

## Source of truth
Use product and system documents first, then this design system, then page overrides.
Figma and approved screenshots are visual guardrails only, not pixel-perfect implementation targets.

Priority order:
1. BNinmyhands PDR
2. System and data specifications
3. Trust, community, and ads policy
4. Launch and QA documents
5. This file
6. `design-system/pages/*.md`
7. Figma and approved screenshots as visual guardrails

## Audience
- Intermediate traders
- Research-oriented users
- Users familiar with funding, OI, taker flow, long-short ratio, and run-based interpretation

## Non-negotiables
- Same-run context stays visible and understandable.
- Persisted-run behavior must remain intact.
- Dashboard to detail `run_id` continuity must not break.
- Disclaimer and policy entry points must remain accessible.
- Ads must never visually impersonate analysis content.
- Community must remain interpretation support, not a generic social product.

## Core UI principles
1. Trust beats novelty.
2. Dense is acceptable; confusing is not.
3. Primary surfaces should feel operational, not promotional.
4. Layout should do more work than borders.
5. Copy should explain scope, freshness, and meaning quickly.
6. Supporting blocks exist to strengthen the main analysis surface, not compete with it.

## Tone and copy
Use utility copy, not marketing copy.

Preferred tone:
- Analytical
- Calm
- Precise
- Low-hype
- Research-forward

Prefer:
- Clear labels
- Short support text
- “What it is / what changed / what to do next” framing
- Explicit freshness and availability language

Avoid:
- Aspirational hero language
- Certainty that sounds like financial advice
- Campaign slogans on product surfaces
- Generic SaaS growth copy

## Layout model
### Desktop
- Global shell at the top
- Run context and current-mode context next
- Primary analysis surface immediately after
- Supporting interpretation below or beside the primary surface

### Tablet
- Preserve hierarchy first
- Reduce density carefully
- Keep same-run context and primary actions near the top

### Mobile
- Stack intentionally
- Preserve run context, symbol status, and main actions above the fold
- Allow table overflow patterns rather than breaking the data layout

## Surface hierarchy
1. Navigation and global status
2. Run freshness, run identity, and active context
3. Primary analysis surface
4. Supporting interpretation blocks
5. Community, sponsor, and secondary utilities

## Visual system
### Color direction
Keep the palette restrained.
Use one primary accent plus semantic status colors.

Defaults:
- Page background: deep graphite or slate
- Raised surface: slightly lighter charcoal/slate
- Text primary: near-white
- Text secondary: cool muted gray
- Divider: low-contrast graphite
- Primary accent: restrained cyan or blue-cyan
- Positive semantic: muted green
- Negative semantic: muted red
- Warning semantic: amber

Funding and risk colors must remain readable and must not dominate the full page.

### Typography
Default type pairing:
- Primary UI font: IBM Plex Sans
- Numeric and data font: JetBrains Mono

Rules:
- Use strong hierarchy before using extra chrome
- Keep labels small but readable
- Align numeric values for comparison
- Use mono only where it improves scanning and trust

### Spacing
- Favor compact density with deliberate grouping
- Separate logic blocks with whitespace before adding frames
- Avoid oversized empty sections

### Borders, radius, and shadows
- Use low-contrast borders only when they add scanning value
- Radius should be moderate, not soft or playful
- Shadows should be subtle
- Surface separation should come more from alignment, tone, and spacing than from heavy card treatments

## Shared component rules
### Header
- Compact and stable
- Product identity should be visible quickly
- Avoid oversized chrome or homepage-style framing

### Run context strip
- Must communicate freshness, run identity, timeframe, and active status at a glance
- Must be compact and scan-friendly
- Must not read like a loose sentence paragraph

### Table and primary analysis surfaces
- Optimize for scanning and comparison
- Align numeric columns cleanly
- Minimize badge clutter
- Preserve density without becoming cramped

### Score and summary blocks
- Compact and comparable
- Meaning should be clearer than ornament

### Funding context
- Treat as explanatory analysis, not decorative metadata
- Latest, absolute, bias, and interpretation should read as one story

### History
- Help validate change and recency
- Avoid turning history into decorative clutter

### Discussion
- Compact and subordinate to analysis
- Write affordances should be obvious for signed-in users
- Guest gating should be calm and predictable

### Sponsored content
- Sponsored label is mandatory
- Sponsored surfaces must remain visibly distinct from analysis surfaces
- Layout must remain stable when sponsored content is disabled

## State design
### Loading
- Calm skeletons
- Preserve layout shape and priority

### Empty
- Explain absence in one sentence
- Suggest a next action only when helpful

### Error
- Concise explanation
- Offer retry or fallback only when meaningful

### Unavailable
- Preserve trust
- Explain when same-run context is missing or invalid

### Degraded
- Use informative banners when freshness or scheduler issues matter
- Be informative, not alarming

## Disclosure rules
### Disclaimer
Must remain accessible from dashboard, detail, and community entry points.
Use stable, non-hype language.

### Sponsored
Always visibly labeled.
Never rely on subtle styling alone.

### Community intro
Frame community as analysis-support discussion only.
Do not present it like a generic public forum.

## Validation baseline
For meaningful UI changes, validate at least:
- Lint
- Build
- Desktop viewport
- Mobile viewport
- Dashboard to detail to back flow
- Guest and write gating where relevant
- First viewport composition when shell or layout changes
