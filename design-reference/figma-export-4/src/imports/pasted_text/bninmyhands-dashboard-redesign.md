Design a polished dark-theme web app UI for a crypto derivatives candidate intelligence dashboard called “BNinmyhands”.

Important context:
This is NOT a blank-slate concept design.
This UI should be based on an already working alpha product with these existing behaviors:
- Dashboard is rendered from the latest persisted run (not live ad-hoc scan)
- Dashboard already has timeframe selection, bucket filtering, sorting, run metadata, rankings table
- Dashboard-to-detail navigation preserves context with URL query params like:
  /coin/ENJUSDT?timeframe=1h&run_id=2
- Coin detail already includes:
  - score cards
  - latest + delta metrics
  - “why this coin”
  - funding context
  - recent history table
  - disclaimer footer
- Invalid run_id / timeframe / symbol already show a friendly unavailable state

Your job is to redesign and elevate the UI/UX only.
Do NOT invent unrelated new product features.
Do NOT redesign the information architecture away from the current alpha structure.
Keep the product grounded as a private-alpha crypto research dashboard for intermediate traders.

Product positioning:
- A derivatives candidate intelligence dashboard
- Helps users quickly identify “which coins to look at today”
- Explains why a candidate was detected using derivatives signals such as OI, taker flow, long/short ratio, funding
- Trust and clarity are more important than flashy visuals
- The UI should feel premium, analytical, modern, dark, and fast to scan

Design goals:
1. Make the dashboard feel like a serious trading research product, not a plain developer table
2. Improve visual hierarchy so the user can immediately understand:
   - latest run / freshness
   - today’s top candidates
   - current strategy preset
   - bucket distribution
   - the full rankings table
3. Make detail pages feel explanation-first:
   - why this coin
   - scores
   - funding interpretation
   - recent history / context
4. Preserve run-context trust:
   - timeframe, run_id, updated timestamp, row count, and data age should feel visibly important
5. Keep the UI realistic for implementation in Next.js + Tailwind

Please design the following screens and components:

A. Dashboard screen
Desktop-first responsive layout.
Include:
- App header / product title
- Latest persisted snapshot metadata area:
  - timeframe
  - run_id
  - updated timestamp
  - row count
  - data age
- Strategy preset selector (this is very important):
  - Breakout
  - Positioning Build
  - Squeeze Watch
  - Overheat Risk
- A short explanation area for the active preset
- Top 5 candidates highlight section above the full table
  - card/grid format
  - each item should show:
    - symbol
    - composite score
    - bucket
    - short reason tags
- Bucket summary cards:
  - breakout candidates
  - positioning-build candidates
  - squeeze-watch candidates
  - overheat-risk candidates
- Controls area:
  - timeframe selector
  - bucket filter
  - sort control
  - symbol search
- Main rankings table
  - visually readable in a dark theme
  - should feel data-dense but clean
  - columns should support:
    symbol, bucket, reason tags, last, 24h %, volume, composite score, rank delta, OI change, taker flow, L/S, and room for funding
- Footer disclaimer:
  “Research / educational use only. Not financial advice. Data may be delayed, incomplete, or stale.”

B. Coin detail screen
Must feel like a high-trust research detail page.
Include:
- Title with symbol and run_id
- Back to dashboard action
- Score cards for:
  - composite
  - momentum
  - setup
  - positioning
  - data quality
- Latest + delta metrics block
- Why this coin block
- Funding context block
  - latest funding
  - absolute funding
  - bias (positive / negative / neutral)
  - short interpretation sentence
- Recent history section
  - compact table or chart-ready card style
- Metadata should make it obvious that this detail page belongs to the same run context as the dashboard
- Keep the disclaimer footer

C. Unavailable / invalid context state
Design a polished friendly empty/error page for invalid coin detail context.
Cases include:
- invalid run_id
- timeframe mismatch
- symbol not found
- no detail available
Requirements:
- calm, trustworthy, non-alarming tone
- clear message
- back to dashboard action
- consistent dark theme

D. Component style system
Please define a clear UI style direction:
- premium dark theme
- restrained accent color
- strong visual hierarchy
- readable typography
- subtle borders, panels, and cards
- good spacing for dense data
- should feel like a mix of institutional terminal + modern SaaS dashboard, but more approachable

Design constraints:
- Do not make it overly colorful
- Do not make it look like a consumer social app
- Do not make it look like a generic crypto exchange clone
- Avoid clutter and visual noise
- Prioritize scanability and trust
- Keep implementation realistic for a frontend built with React / Next.js / Tailwind

Information architecture constraints:
Keep the alpha structure:
- / = dashboard
- /coin/[symbol] = detail
Do not add unrelated pages like community, watchlist, news, chat, etc.
Do not introduce mobile-only gimmicks.
Focus on a clean desktop-first private-alpha experience.

Output requested:
- A polished dashboard screen
- A polished coin detail screen
- A polished unavailable state screen
- Reusable component styling for cards, tabs/chips, filters, tables, metadata blocks
- Consistent dark design system
- Strong emphasis on strategy presets and top candidates