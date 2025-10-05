import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // Dev-only: prints magic links to console instead of sending.
      // Replace with a real transport later (Resend/Postmark/Sendgrid).
      server: {
        host: "localhost",
        port: 1025, // or leave as dummy; NextAuth will log the link
        auth: { user: "", pass: "" },
      },
      from: "login@cerebralpeople.local",
      sendVerificationRequest({ url }) {
        console.log("🔗 Sign-in link:", url);
      }
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      return session;
    },
  },
});

export const { GET, POST } = handlers;