import { NextRequest, NextResponse } from "next/server";

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

    // Simulated duplicate check (e.g. if test simulated duplicate flag is sent)
    if (data.postcode === "DUP1 1IC" || data.is_duplicate_test) {
      return NextResponse.json(
        {
          error: "This opportunity may already have been submitted. We have not created another submission. If you believe this is incorrect, please contact us.",
          code: "DUPLICATE_SUBMISSION",
        },
        { status: 409 }
      );
    }

    // Generate unique reference
    const submission_id = `EUK-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const timestamp = new Date().toISOString();

    // In this Phase 1 foundation, we log the payload to demonstrate the clean integration boundary
    console.log("[Entire UK Opportunity Intake Received]", {
      submission_id,
      submission_type,
      received_at: timestamp,
      contact: { name: data.name, email: data.email, phone: data.phone },
      property: { address: data.address, postcode: data.postcode, size: data.size },
    });

    return NextResponse.json(
      {
        success: true,
        submission_id,
        submission_type,
        status: "received",
        created_at: timestamp,
        message: "Submission received. It will be reviewed against our acquisition criteria.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Submission API Error]", err);
    return NextResponse.json(
      { error: "Internal server error occurred while persisting submission." },
      { status: 500 }
    );
  }
}
