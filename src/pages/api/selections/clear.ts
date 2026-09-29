import type { APIRoute } from "astro";
import { clearPlan } from "../../../lib/db";

// Same no-JS form-POST-and-redirect pattern as add/remove, for the "remove
// all" action in the plan header.
export const POST: APIRoute = async ({ redirect }) => {
  clearPlan();
  return redirect("/", 303);
};
