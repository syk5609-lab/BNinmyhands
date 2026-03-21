# Dashboard Page Design Rules

This file defines Dashboard-specific overrides and composition priorities.
Use it together with `design-system/MASTER.md`.

## Page goal
Help users narrow today’s most worth-watching symbols quickly, then move into a same-run detail view with confidence.

## Dashboard identity
The dashboard is a primary workspace.
It should feel like one operational analysis surface, not a mosaic of detached product cards.

The rankings table is the main surface.
Everything above it should improve interpretation, navigation, or scanning efficiency.

## Composition
Recommended order:
1. Global shell and header
2. Run context and active mode context
3. Strategy preset context
4. Top highlights or top candidates
5. Bucket summary
6. Full rankings
7. Secondary sponsor insertion where it does not interrupt scanning

## First viewport rules
- Desktop must not accidentally collapse into a one-column feel.
- The first viewport should reveal context plus meaningful analysis, not decorative chrome.
- Users should immediately understand what to scan next.
- Rankings should appear early enough on desktop to reinforce that this is a workspace.

## Header rules
- Keep the top shell compact but authoritative.
- Product identity, current page, and sign-in or account action should be immediately legible.
- Navigation should feel utility-driven, not promotional.

## Run context strip rules
- Must expose freshness, run identity, timeframe, and active status quickly.
- Use compact scan structures, not long prose.
- Visual treatment should reinforce importance without becoming decorative.

## Strategy preset rules
- Presets should read as a true four-card row on desktop.
- Each preset should contain a label and short explanation.
- Active state should be obvious but restrained.
- The preset row should feel intentional and operational, not playful or toy-like.

## Top highlights rules
- Top candidates should appear as compact analysis cards.
- They must not read like stretched rows or pseudo-table fragments.
- The section should support fast interpretation, not vanity KPI display.

## Bucket summary rules
- Bucket summary should be visually secondary to rankings.
- Use compact colored cards with legible counts and proportions.
- Do not let bucket cards dominate the viewport.
- Avoid list-row behavior or oversized framed blocks.

## Rankings rules
- Rankings are the primary workspace.
- Optimize for numeric comparison and scanning rhythm.
- Use minimal cell chrome and consistent alignment.
- Mobile may use horizontal scrolling or careful fallback treatment, but desktop should preserve table density and integrity.

## Sponsor rules
- Sponsored content must be clearly labeled.
- Sponsored slots must preserve layout stability when disabled.
- Sponsor treatment must remain obviously separate from analysis content.
- Sponsored placement should not interrupt the user’s scan path into the rankings table.

## Copy rules
Prefer labels such as:
- Latest run
- Strategy preset
- Top candidates
- Bucket summary
- Full rankings
- Updated
- Unavailable

Avoid:
- Homepage slogans
- Marketing CTA copy
- Ambiguous “smart” or “AI alpha” language

## Do
- Use spacing, alignment, and dividers before adding more frames
- Keep the page dense but readable
- Preserve first-viewport hierarchy carefully
- Make dashboard to detail movement feel immediate and same-run aware

## Do not
- Do not turn the dashboard into a card mosaic
- Do not bury the rankings surface below oversized summary blocks
- Do not let preset, sponsor, or bucket sections overshadow the main table
- Do not use decorative gradients or hero-style page framing
