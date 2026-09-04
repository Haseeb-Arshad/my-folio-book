import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  capturePostHogEvent,
  getAnalyticsVisitorId,
} from "../lib/analytics.client";

export default function PostHogAnalytics() {
  const location = useLocation();

  useEffect(() => {
    capturePostHogEvent("$pageview", {
      route_path: location.pathname,
      route_search: location.search || undefined,
      portfolio_visitor_id: getAnalyticsVisitorId(),
    });
  }, [location.pathname, location.search]);

  return null;
}
