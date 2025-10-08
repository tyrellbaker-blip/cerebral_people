import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Allow linking Google accounts to existing accounts with same email
  // This is safe because we trust Google's email verification
  allowDangerousEmailAccountLinking: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        };
      },
    }),
    EmailProvider({
      server: {
        host: "localhost",
        port: 587,
        auth: {
          user: "",
          pass: "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@cerebralpeople.com",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (!resend) {
          console.error("Resend API key not configured");
          throw new Error("Email service not configured");
        }

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "Cerebral People <noreply@cerebralpeople.com>",
            to: email,
            subject: "Sign in to Cerebral People",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; margin: 20px 0;">
                    <h1 style="color: #000; margin-top: 0;">Sign in to Cerebral People</h1>
                    <p style="font-size: 16px; color: #555;">Click the button below to sign in to your account:</p>
                    <div style="margin: 30px 0;">
                      <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: 600;">Sign In</a>
                    </div>
                    <p style="font-size: 14px; color: #777;">If you didn't request this email, you can safely ignore it.</p>
                    <p style="font-size: 14px; color: #777;">This link will expire in 24 hours.</p>
                  </div>
                  <p style="font-size: 12px; color: #999; text-align: center;">Cerebral People - Connecting the CP community</p>
                </body>
              </html>
            `,
          });
        } catch (error) {
          console.error("Failed to send email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // No maxAge = session cookie (expires on browser close)
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // If signing in with Google
      if (account?.provider === "google") {
        const email = user.email;

        if (!email) {
          return false;
        }

        // Check if user exists and their status
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, status: true },
        });

        // If user exists, check if they're active
        if (existingUser && existingUser.status !== "ACTIVE") {
          return false;
        }

        // Allow sign in - adapter will handle account linking
        return true;
      }

      // For other providers, allow by default
      return true;
    },
    async jwt({ token, user, account }) {
      // On sign in, add user info to token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        // Verify user still exists in database
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, role: true, status: true },
        });

        // If user doesn't exist, return null to invalidate session
        if (!user) {
          return null as any;
        }

        (session.user as any).id = token.sub;
        (session.user as any).role = user.role;
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;