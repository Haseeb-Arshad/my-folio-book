import { redirect } from "react-router";

/* /blog is kept as a backwards-compatible alias for the Blogs page. */
export function loader() {
  return redirect("/reading");
}
