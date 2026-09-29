import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Course, type Selection, courses, selections } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

// The catalogue is seeded, not migrated: it's sample timetable data standing
// in for what a real system would import from the enrolment office. Each row
// is keyed on `code` (unique) and inserted with onConflictDoNothing, so this
// runs safely on every boot -- extending the list here backfills new rows
// into an already-seeded database (deployed or local) without touching
// existing rows or any student's saved plan.
{
  db.insert(courses)
    .values([
      { code: "COMP1100", title: "Introduction to Programming", day: "Mon", startTime: "14:00", endTime: "16:00", room: "Hanna Neumann 1.33" },
      { code: "COMP2100", title: "Software Design Methodologies", day: "Mon", startTime: "10:00", endTime: "12:00", room: "Hanna Neumann 1.30" },
      { code: "COMP3610", title: "Principles of Programming Languages", day: "Mon", startTime: "10:00", endTime: "12:00", room: "CSIT N101" },
      { code: "COMP2600", title: "Formal Methods for Software Engineering", day: "Tue", startTime: "11:00", endTime: "13:00", room: "CSIT N102" },
      { code: "COMP3600", title: "Algorithms", day: "Tue", startTime: "09:00", endTime: "11:00", room: "Manning Clark 1" },
      { code: "COMP2620", title: "Higher Computing", day: "Wed", startTime: "09:00", endTime: "11:00", room: "CSIT N101" },
      { code: "COMP4020", title: "Agentic Coding Studio", day: "Wed", startTime: "14:00", endTime: "15:30", room: "Marie Reay 4.03" },
      { code: "COMP3120", title: "Advanced Databases", day: "Wed", startTime: "14:30", endTime: "16:00", room: "CSIT N103" },
      { code: "COMP2550", title: "Studio 2: Building Reliable Software", day: "Thu", startTime: "13:00", endTime: "15:00", room: "Birch 101" },
      { code: "COMP3550", title: "Studio 3: Software Product", day: "Thu", startTime: "15:00", endTime: "17:00", room: "Birch 101" },
      { code: "COMP3530", title: "Advanced Computer Networks", day: "Thu", startTime: "10:00", endTime: "12:00", room: "Ian Ross 1" },
      { code: "COMP4610", title: "Principles of Autonomous Agents", day: "Fri", startTime: "09:00", endTime: "11:00", room: "Manning Clark 2" },
    ])
    .onConflictDoNothing()
    .run();
}

export type { Course, Selection };

export function listCourses(): Course[] {
  return db.select().from(courses).orderBy(courses.day, courses.startTime).all();
}

export type PlannedCourse = Selection & { course: Course; clashesWith: string[] };

// Two sessions clash when they fall on the same day and their time ranges
// overlap. Comparing the HH:MM strings directly is safe: zero-padded 24-hour
// strings sort exactly like the times they represent.
function overlaps(a: Course, b: Course): boolean {
  return a.day === b.day && a.startTime < b.endTime && b.startTime < a.endTime;
}

export function listPlan(): PlannedCourse[] {
  const rows = db
    .select({ selection: selections, course: courses })
    .from(selections)
    .innerJoin(courses, eq(selections.courseId, courses.id))
    .orderBy(courses.day, courses.startTime)
    .all();

  return rows.map(({ selection, course }) => ({
    ...selection,
    course,
    clashesWith: rows
      .filter((other) => other.selection.id !== selection.id && overlaps(course, other.course))
      .map((other) => other.course.code),
  }));
}

export function addSelection(courseId: number): void {
  db.insert(selections).values({ courseId }).onConflictDoNothing().run();
}

export function removeSelection(id: number): void {
  db.delete(selections).where(eq(selections.id, id)).run();
}

export function clearPlan(): void {
  db.delete(selections).run();
}
