"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendVerificationEmail(email: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("No account found with this email address");
  }

  // Check if already verified
  if (user.emailVerified) {
    throw new Error("This email address is already verified");
  }

  // Delete any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: expiresAt,
    },
  });

  // Send verification email
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Cerebral People <noreply@cerebralpeople.com>",
    to: email,
    subject: "Cerebral People - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #78350f; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 30px; margin: 20px 0;">
            <h1 style="color: #78350f; margin-top: 0;">Verify Your Email</h1>
            <p style="font-size: 16px; color: #92400e;">Hi ${user.profile?.displayName || "there"},</p>
            <p style="font-size: 16px; color: #92400e;">Please verify your email address to complete your registration:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; background-color: #d97706; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #92400e;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #b45309; word-break: break-all;">${verificationUrl}</p>
            <p style="font-size: 14px; color: #92400e;">This link will expire in 24 hours.</p>
          </div>
          <p style="font-size: 12px; color: #d97706; text-align: center;">Cerebral People - Connecting the CP community</p>
        </body>
      </html>
    `,
  });
}
