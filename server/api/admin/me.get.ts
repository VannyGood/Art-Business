import { defineEventHandler } from "h3";
import { isAdminAuthed } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  return { authed: isAdminAuthed(event) };
});
