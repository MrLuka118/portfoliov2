import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

// NextAuth route handler za App Router.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
