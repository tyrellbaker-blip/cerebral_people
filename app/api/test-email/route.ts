import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET() {
  if (!resend) {
    return NextResponse.json(
      {
        success: false,
        error: "Resend API key not configured",
      },
      { status: 500 }
    );
  }

  try {
    // Test email sending
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Cerebral People <noreply@cerebralpeople.com>",
      to: "delivered@resend.dev", // Resend's test email
      subject: "Test Email from Cerebral People",
      html: "<p>This is a test email. If you receive this, Resend is configured correctly!</p>",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}
