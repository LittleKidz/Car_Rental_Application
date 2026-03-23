export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/rentals/:path*", "/admin/:path*"],
};
