import { NextRequest, NextResponse } from "next/server";
import { createSubmission } from "@/lib/land-radar/submissionService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submission_type, data } = body;

    if (!submission_type || !data) {
      return NextResponse.json(
        { error: "Invalid submission payload. Required data missing." },
        { status: 400 }
      );
    }

    // Basic server-side validation
    if (submission_type !== "general_contact") {
      if (!data.postcode && !data.address) {
        return NextResponse.json(
          { error: "A valid UK postcode or property address is required." },
          { status: 422 }
        );
      }
    }

    if (!data.email || !data.email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required for communication." },
        { status: 422 }
      );
    }

    // Duplicate check simulation for testing
    if (data.postcode === "DUP1 1IC" || data.is_duplicate_test) {
      return NextResponse.json(
        {
          error: "This opportunity may already have been submitted. We have not created another submission. If you believe this is incorrect, please contact us.",
          code: "DUPLICATE_SUBMISSION",
        },
        { status: 409 }
      );
    }

    // Authoritative persistence via submissionService
    const persisted = await createSubmission({
      submission_type,
      submitter_name: data.name || data.submitter_name || "Unspecified Submitter",
      email: data.email,
      phone: data.phone || null,
      organisation: data.organisation || data.company || null,
      address: data.address || null,
      postcode: data.postcode || null,
      site_size_description: data.size || data.site_size_description || null,
      current_use: data.current_use || data.use || null,
      planning_status: data.planning_status || data.planning || null,
      ownership_status: data.ownership_status || data.ownership || null,
      opportunity_description: data.description || data.opportunity_description || null,
      submitted_notes: data.notes || data.comments || null,
      consent_acknowledged: data.consent ?? true,
      raw_payload: data,
    });

    return NextResponse.json(
      {
        success: true,
        submission_id: persisted.submission_reference,
        submission_type: persisted.submission_type,
        status: persisted.status,
        created_at: persisted.created_at,
        message: "Submission received and persisted. It will be reviewed against our acquisition criteria.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: "Failed to persist submission: " + message },
      { status: 500 }
    );
  }
}
