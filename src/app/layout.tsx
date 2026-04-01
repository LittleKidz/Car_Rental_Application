import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import NextAuthProvider from "@/providers/NextAuthProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import TopMenu from "@/components/TopMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoGo — Rental Car Booking",
  description: "Book your perfect ride from top rental car providers",
  icons: {
    icon: "/img/GoGo.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextAuthProvider session={session}>
          <ReduxProvider>
            <TopMenu />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </ReduxProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
