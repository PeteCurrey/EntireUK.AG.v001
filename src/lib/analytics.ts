// Lead & Conversion Analytics Helper
// Ensures NO Personally Identifiable Information (PII) is transmitted

export type AnalyticsEvent =
  | { name: "cta_submit_opportunity_clicked"; properties?: { location?: string } }
  | { name: "cta_submit_land_clicked"; properties?: { location?: string } }
  | { name: "cta_submit_property_clicked"; properties?: { location?: string } }
  | { name: "cta_contact_clicked"; properties?: { location?: string } }
  | { name: "submission_started"; properties: { submission_type: string } }
  | { name: "submission_step_completed"; properties: { submission_type: string; step: number; step_name: string } }
  | { name: "submission_validation_error"; properties: { submission_type: string; step: number; field_name: string } }
  | { name: "submission_abandoned"; properties: { submission_type: string; last_step: number } }
  | { name: "submission_attempted"; properties: { submission_type: string } }
  | { name: "submission_completed"; properties: { submission_type: string; submission_id: string } }
  | { name: "submission_failed"; properties: { submission_type: string; error_code?: string } }
  | { name: "file_upload_started"; properties: { file_type: string; file_size_category: string } }
  | { name: "file_upload_completed"; properties: { file_type: string } }
  | { name: "file_upload_failed"; properties: { reason: string } };

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // Log in development for auditability
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics Event] ${event.name}`, "properties" in event ? event.properties : {});
  }

  // Google Analytics 4 integration boundary
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
    if (typeof w.gtag === "function") {
      w.gtag("event", event.name, "properties" in event ? event.properties : {});
    }
  } catch {
    // Fail silently in environments where adblockers or privacy controls suppress analytics
  }
}
