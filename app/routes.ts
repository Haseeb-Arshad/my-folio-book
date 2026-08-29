import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("work", "routes/work.tsx"),
  route("blog", "routes/blog.tsx"),
  // route("photos", "routes/photos.tsx"),
  route("connect", "routes/connect.tsx"),
  route("now", "routes/now.tsx"),
  route("agent", "routes/agent.tsx"),
  route("resume", "routes/resume.ts"),
  route("api/chat", "routes/api.chat.ts"),
  route("playground", "routes/playground.tsx"),
] satisfies RouteConfig;
