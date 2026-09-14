export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/submit/:path*", "/queue/:path*", "/admin/:path*", "/ticket/:path*"],
};
