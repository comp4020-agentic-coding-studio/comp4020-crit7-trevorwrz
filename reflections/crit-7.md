# Crit 7 reflection

**What was the breakthrough that moved the work forward?**

Deciding the clash check had to be a same-day, overlapping-range comparison on
the actual stored sessions, not a rule I described in prose. Once I said
"flag it if two of my planned sessions overlap in time," the agent turned that
into a join over `selections` and `courses` with a plain string comparison
(`startA < endB && startB < endA`) that runs against whatever's really in the
database — so the check works for any course I add, not just the two I tested
with. That's the difference between a demo and a system: the guestbook
starter proved messages persist, but this had to prove a *relationship*
between rows persists and gets evaluated correctly, which is what course
selection actually needed and what ISIS never gives me.

**What did this work change about who I want to be as a software developer?**

I noticed how much of directing the agent was refusing to accept green tests
as the whole story — `pnpm check` passed the first time I asked for the
clash-checker test, but I only trusted it once I'd read the rendered page
myself and caught a typo the tests would never have flagged. I want to keep
that habit: tests are backpressure on the mechanism, not a substitute for
looking at what actually shipped. I also had to solve a real environment
problem (no C++ toolchain for `better-sqlite3`) rather than route around it
with a different database — the easy way out would have cost me the stack the
brief actually asked me to learn.
