import { describe, expect, inject, it } from "vitest";

// This week's contract, turned into checks: the core flow persists across a
// reload, and the app's actual promise — a clash between two planned
// sessions is flagged — holds against the running server, not just the
// source. COMP4020 and COMP3120 in the seed data overlap on Wednesday
// afternoon on purpose; see src/lib/db.ts.
const baseUrl = inject("baseUrl");

// Astro checks form POSTs carry a same-origin Origin header (CSRF
// protection); browsers send it automatically, a bare fetch doesn't.
const post = (path: string, body: URLSearchParams) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });

async function findCourseId(code: string): Promise<number> {
  const html = await (await fetch(baseUrl)).text();
  const idMatch = html.match(
    new RegExp(`<strong>${code}</strong>[\\s\\S]*?name="courseId" value="(\\d+)"`),
  );
  if (!idMatch) throw new Error(`could not find courseId for ${code}`);
  return Number(idMatch[1]);
}

describe("clash checker", () => {
  it("adding a course to the plan persists across a reload", async () => {
    const courseId = await findCourseId("COMP4020");
    const res = await post("/api/selections", new URLSearchParams({ courseId: String(courseId) }));
    expect(res.status).toBe(303);

    const html = await (await fetch(baseUrl)).text();
    expect(html).toContain("COMP4020");
  });

  it("flags two planned courses that overlap in time", async () => {
    const clashingId = await findCourseId("COMP3120");
    await post("/api/selections", new URLSearchParams({ courseId: String(clashingId) }));

    const html = await (await fetch(baseUrl)).text();
    expect(html).toContain("clashes with");
  });
});
