import { sql } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.

// The catalogue: every offered course session. Seeded at boot (see db.ts) —
// this stands in for the part of the real system nobody but the timetabling
// office edits.
export const courses = sqliteTable(
  "courses",
  {
    id: int().primaryKey({ autoIncrement: true }),
    code: text().notNull(),
    title: text().notNull(),
    day: text().notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    room: text().notNull(),
  },
  (table) => [unique().on(table.code)],
);

// The plan: the courses you've put yourself into. This is the part of the
// real system that's all state — add one, and it's still there next reload;
// two overlapping sessions in here is exactly the clash ISIS never warns you
// about until the day it matters.
export const selections = sqliteTable(
  "selections",
  {
    id: int().primaryKey({ autoIncrement: true }),
    courseId: int("course_id")
      .notNull()
      .references(() => courses.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [unique().on(table.courseId)],
);

export type Course = typeof courses.$inferSelect;
export type Selection = typeof selections.$inferSelect;
