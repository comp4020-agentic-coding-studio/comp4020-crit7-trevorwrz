# Process overview

## What I built

A course-selection clash checker: a seeded catalogue of course sessions and a
persistent plan, with any two planned sessions that overlap in time flagged
automatically.

## How I got here

I picked the topic first: ANU's course selection tells you what's on offer but
never whether two of your picks collide, so that's the slice I modelled.
[`e804e9f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-trevorwrz/commit/e804e9f)
carries the harness forward from `comp4020-ass2` — I kept only the "commit as
you go, keep `pnpm check` green" process rule and dropped that repo's content
rules, which were specific to Assignment 2's fictional course-content site and
don't apply to a database-backed app.

> 课程选课/冲突检查 (course selection / clash checking)

was the whole brief I gave the agent for the topic; everything else — schema,
routes, the seed data, the overlap check — was its design, which I reviewed
against what I actually wanted: I checked the clash logic (same day, `startA <
endB && startB < endA`) matched what "collides on my timetable" means, and
that adding/removing a course still worked with JavaScript off, since that's
the one thing the starter's guestbook got right and I didn't want to lose it.

[`645fb68`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-trevorwrz/commit/645fb68)
replaces the guestbook schema with `courses` and `selections` and adds the
clash-detecting join;
[`46cad49`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-trevorwrz/commit/46cad49)
wires the add/remove routes and the page, and drops the SSE broadcast — a
personal plan has no second client to notify, so I had the agent remove it
rather than keep unused plumbing;
[`93cc0db`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-trevorwrz/commit/93cc0db)
turns two of the spec's lines into tests: reload-persistence, and the clash
flag actually appearing for two sessions the seed data deliberately overlaps.

I ran `pnpm check` after each step and read the failing case before accepting
a fix rather than taking green on faith — the one real correction was a typo
in the seed data ("Sofware" → "Software") I caught by reading the rendered
page, not a test. I also hit a genuine environment gap: `better-sqlite3`
needs a native build, and this machine had no C++ toolchain, so I installed
Visual Studio Build Tools before anything would `pnpm install`.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.
