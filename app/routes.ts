import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("work", "routes/work.tsx"),
  route("work/:slug", "routes/case-study.tsx"),
  route("reading", "routes/reading.tsx"),
  route("blog", "routes/blog.tsx"), // redirects to /reading
  // route("photos", "routes/photos.tsx"),
  route("connect", "routes/connect.tsx"),
  route("now", "routes/now.tsx"),
  route("agent", "routes/agent.tsx"),
  route("resume", "routes/resume.tsx"),
  route("api/chat", "routes/api.chat.ts"),
  route("playground", "routes/playground.tsx"),
] satisfies RouteConfig;
