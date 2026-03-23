import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name: string;
      email: string;
      telephone: string;
      role: string;
      token: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    name: string;
    email: string;
    telephone: string;
    role: string;
    token: string;
  }
}
