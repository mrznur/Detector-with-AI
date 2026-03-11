import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("persons", "routes/persons.tsx"),
  route("cameras", "routes/cameras.tsx"),
  route("logs", "routes/logs.tsx"),
  route("verification", "routes/verification.tsx"),
] satisfies RouteConfig;
