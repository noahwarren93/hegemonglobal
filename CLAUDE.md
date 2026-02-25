# CLAUDE.md - Hegemon Global Development Rules

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for any non-trivial task (three or more steps, or involving architectural decisions).
- If something goes wrong, stop and re-plan immediately rather than continuing blindly.
- Use plan mode for verification steps, not just implementation.
- Write detailed specifications upfront to reduce ambiguity.

### 2. Subagent Strategy
- Use subagents liberally to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, allocate more compute via subagents.
- Assign one task per subagent to ensure focused execution.

### 3. Self-Improvement Loop
- After any correction from the user, update tasks/lessons.md with the relevant pattern.
- Create rules for yourself that prevent repeating the same mistake.
- Iterate on these lessons rigorously until the mistake rate declines.
- Review lessons at the start of each session when relevant to the project.

### 4. Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, and demonstrate correctness.

### 5. Demand Elegance (Balanced)
- For non-trivial changes, pause and ask whether there is a more elegant solution.
- If a fix feels hacky, implement the solution you would choose knowing everything you now know.
- Do not over-engineer simple or obvious fixes.
- Critically evaluate your own work before presenting it.

### 6. Autonomous Bug Fixing
- When given a bug report, fix it without asking for unnecessary guidance.
- Review logs, errors, and failing tests, then resolve them.
- Avoid requiring context switching from the user.
- Fix failing CI tests proactively.

## Task Management
1. Plan First: Write the plan to tasks/todo.md with checkable items.
2. Verify Plan: Review before starting implementation.
3. Track Progress: Mark items complete as you go.
4. Explain Changes: Provide a high-level summary at each step.
5. Document Results: Add a review section to tasks/todo.md.
6. Capture Lessons: Update tasks/lessons.md after corrections.

## Core Principles
- Simplicity First: Make every change as simple as possible. Minimize code impact.
- No Laziness: Identify root causes. Avoid temporary fixes. Apply senior developer standards.
- Minimal Impact: Touch only what is necessary. Avoid introducing new bugs.

## Hegemon-Specific Rules
- Build must pass before committing. Always merge react-migration to master and push for deployment.
- After any fix, hard refresh (clear localStorage cache) and verify visually before committing.
- Never change sidebar CSS without verifying watchlist, Trade Routes, Compare Mode, and Risk Levels all fit without overlapping.
- The Worker is at hegemon-rss-proxy.hegemonglobal.workers.dev — deploy with wrangler after changes.
- RSS feeds go through Cloudflare Worker. Events are pre-generated via cron and served from KV.
- Stock data uses Yahoo Finance API via CORS proxies with CoinGecko fallback for Bitcoin.
- The updateDynamicRisks function was optimized to skip redundant IRRELEVANT_KEYWORDS checks — do not revert this.
- Critical Watchlist shows all CATASTROPHIC + EXTREME countries — do not remove any.
- Never introduce changes that block the main thread. If processing large datasets, use chunked async with yields.
- Test in incognito after any major change to ensure no caching issues.
