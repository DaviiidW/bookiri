import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email, ensuring they are not soft-deleted
        const user = await db.user.findUnique({
          where: {
            email,
            deletedAt: null,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = verifyPassword(password, user.passwordHash);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (token?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { deletedAt: true },
        });
        if (!dbUser || dbUser.deletedAt !== null) {
          // Returning null invalidates the JWT and kicks out the user
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
