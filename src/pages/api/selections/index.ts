import type { APIRoute } from "astro";
import { addSelection } from "../../../lib/db";

// A plain HTML form POSTs here with the course's id; the 303 redirect makes
// this work with no client-side JavaScript — the page re-renders the plan
// straight from SQLite.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const courseId = Number(form.get("courseId"));
  if (Number.isInteger(courseId)) {
    addSelection(courseId);
  }
  return redirect("/", 303);
};
