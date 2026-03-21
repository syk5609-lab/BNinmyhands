# Detail Page Design Rules

This file defines Detail-specific overrides and composition priorities.
Use it together with `design-system/MASTER.md`.

## Page goal
Explain one symbol in the same-run context so the user understands why it surfaced, what changed, and how to interpret the signal.

## Detail identity
The detail page is a same-run analysis story.
It should read as one coherent explanatory surface, not a stack of unrelated widgets.

## Composition
Recommended order:
1. Symbol header and run context
2. Score overview
3. Latest and delta context
4. Why this coin
5. Funding context
6. Recent history
7. Discussion
8. Sponsor slot

## Same-run continuity
- Dashboard to detail continuity must stay obvious.
- The active run and current symbol context should remain visible early.
- Detail should feel like a deeper layer of the same analysis session, not a separate product surface.

## Header and context rules
- The symbol, bucket, timeframe, and run context should anchor the page quickly.
- Context should support trust and interpretation, not decorative status noise.

## Score overview rules
- Show the main scores in a compact, comparable way.
- Score presentation should support meaning first and ornament second.

## Latest and delta rules
- Latest values and deltas should read as current-state plus change context.
- Prioritize comparison and interpretation over visual flourish.

## Why-this-coin block
- The reason tags or explanation should clarify why the symbol surfaced in this run.
- This section should feel explanatory, not promotional.

## Funding block rules
- Funding context is explanatory analysis, not decorative metadata.
- Show latest funding, absolute funding, bias, and interpretation as one coherent block.
- The user should be able to understand funding significance without scanning multiple disconnected widgets.

## History block rules
- Recent history should validate recency and change.
- Use it to support confidence and context, not to add visual clutter.

## Discussion rules
- Discussion must sit below the analysis.
- It is interpretation support only, not a generic social feed.
- Guest gating, write affordances, and moderation controls should be calm and unobtrusive.

## Sponsor rules
- Sponsor placement belongs at the bottom of the detail page.
- Sponsored slots must preserve layout stability when disabled.
- Sponsor styling must remain clearly distinct from score, funding, history, and discussion surfaces.

## Responsive rules
- On mobile, preserve run context and key score or funding meaning above the fold.
- Avoid breaking the analysis story into disconnected fragments.
- Reduce density carefully without losing same-run continuity.

## Do
- Preserve the narrative order of the analysis
- Keep funding and history explanatory
- Make discussion clearly subordinate
- Reinforce continuity back to the dashboard

## Do not
- Do not stack unrelated widgets without narrative structure
- Do not treat funding like decorative metadata
- Do not let discussion or sponsor content compete with the analysis
- Do not make detail feel like a generic social or news page
