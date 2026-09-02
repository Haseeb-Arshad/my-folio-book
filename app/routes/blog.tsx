import { redirect } from "react-router";

/* /blog moved to /reading once the page grew beyond essays into a personal
   book history. Kept as a redirect for anything that linked the old path. */
export function loader() {
  return redirect("/reading");
}
