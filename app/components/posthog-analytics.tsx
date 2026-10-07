import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  capturePostHogEvent,
  getAnalyticsVisitorId,
  setOwnerAnalyticsPrivacy,
} from "../lib/analytics.client";

export default function PostHogAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const ownerPage = location.pathname.startsWith("/admin");
    setOwnerAnalyticsPrivacy(ownerPage);
    if (ownerPage) return;
    capturePostHogEvent("$pageview", {
      route_path: location.pathname,
      route_search: location.search || undefined,
      portfolio_visitor_id: getAnalyticsVisitorId(),
    });
  }, [location.pathname, location.search]);

  return null;
}
