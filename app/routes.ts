import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("work", "routes/work.tsx"),
  route("photos", "routes/photos.tsx"),
  route("connect", "routes/connect.tsx"),
  route("now", "routes/now.tsx"),
  route("playground", "routes/playground.tsx"),
] satisfies RouteConfig;
