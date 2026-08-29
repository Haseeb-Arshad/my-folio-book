import { redirectDocument } from "react-router";

export function loader() {
  return redirectDocument("/resume.pdf");
}
