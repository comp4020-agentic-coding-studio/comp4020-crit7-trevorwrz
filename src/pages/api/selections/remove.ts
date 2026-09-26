import type { APIRoute } from "astro";
import { removeSelection } from "../../../lib/db";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) {
    removeSelection(id);
  }
  return redirect("/", 303);
};
