# Clash checker

A course-selection clash checker: pick sessions from a catalogue into your
plan, and it flags any two you've picked that overlap in time. It's the ANU
system I actually deal with every enrolment period — course selection tells
you what's offered, but not whether two of your picks collide, so you find out
by staring at two timetables side by side. This models that one slice: a
catalogue of sessions and a plan, wired end to end against a real database, so
the clash check runs on your actual picks rather than something you have to
work out by hand.

## What good looks like here

Good here is narrow on purpose: this isn't the whole enrolment system, just
the part that reliably wastes my time. What I decided:

- **The plan is state, not a form.** Adding a course writes a row to SQLite,
  and it survives a reload — that's the one thing a clash checker has to get
  right, or it isn't worth using over a spreadsheet.
- **Clash detection is a same-day, overlapping-range check** — two sessions
  clash when they share a day and their time ranges intersect, which is what
  "collides on your timetable" actually means. It's enforced by
  `spec/clash-checker.test.ts`, which adds two courses the seed data
  deliberately overlaps and checks the page says so.
- **No login, one shared plan.** A real system has one plan per student; this
  prototype models the mechanism (catalogue → plan → clash) for a single
  user, which is the judgement call — multi-user accounts would be more
  system than this week's slice needs.
- **No client-side JavaScript for the core flow.** Adding and removing a
  course is a plain form POST with a redirect, so it works with JS off; that's
  enforced by the shared invariants, not a choice specific to this app.

What's a judgement call rather than a check: whether the catalogue's seed
courses are a believable stand-in for a real timetable, and whether flagging
a clash with plain red text is clear enough without more visual design.
