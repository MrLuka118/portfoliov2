import { withAuth } from "next-auth/middleware";

/**
 * Zaščiti admin panel: vse poti pod /admin razen prijavne strani.
 * Neprijavljene uporabnike preusmeri na /admin/login.
 */
export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Prijavna stran je vedno dostopna; ostalo zahteva veljaven token.
      if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
