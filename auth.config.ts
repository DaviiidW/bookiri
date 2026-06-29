import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnRoot = nextUrl.pathname === "/";

      if (isOnDashboard || isOnRoot) {
        if (isLoggedIn) {
          if (isOnRoot) {
            return Response.redirect(new URL("/dashboard/calendario", nextUrl));
          }
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard/calendario", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Configured with providers in auth.ts
} satisfies NextAuthConfig;

export default authConfig;
