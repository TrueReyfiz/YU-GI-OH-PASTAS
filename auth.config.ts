import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      const isPublic =
        pathname.startsWith("/login") || pathname.startsWith("/register")

      if (isPublic) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
        return true
      }

      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) (session.user as any).id = token.id as string
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
