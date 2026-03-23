import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) return null;

        // fetch user profile with the token
        const meRes = await fetch(`${process.env.BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const meData = await meRes.json();
        if (!meRes.ok || !meData.success) return null;

        return {
          id: meData.data._id,
          _id: meData.data._id,
          name: meData.data.name,
          email: meData.data.email,
          telephone: meData.data.telephone,
          role: meData.data.role,
          token: data.token,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user } as JWT;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        _id: token._id as string,
        name: token.name as string,
        email: token.email as string,
        telephone: token.telephone as string,
        role: token.role as string,
        token: token.token as string,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
