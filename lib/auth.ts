import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/totp";

/** Posebna oznaka napake, ki jo prijavni obrazec prepozna (manjka/napačna 2FA koda). */
export const TOTP_REQUIRED = "TOTP_REQUIRED";

/** Trajanje seje (30 dni), da ostaneš prijavljen in ti ni treba vsakič login. */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * NextAuth konfiguracija. Dva načina prijave:
 *  1) "credentials" – e-pošta + geslo (bcrypt) + obvezna TOTP 2FA koda,
 *     če ima uporabnik vklopljeno dvofaktorsko avtentikacijo.
 *  2) "qr" – prijava prek QR kode: zaupanja vredna naprava (telefon) odobri
 *     zahtevo, računalnik pa unovči enkratni token (brez tipkanja gesla).
 * Seje so JWT (brez dodatne tabele) in trajajo 30 dni.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "E-pošta", type: "email" },
        password: { label: "Geslo", type: "password" },
        totp: { label: "2FA koda", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        // Drugi faktor: če ima uporabnik vklopljen TOTP, je koda obvezna.
        if (user.totpSecret) {
          const code = credentials.totp?.trim();
          if (!code) {
            // Sporoči obrazcu, naj prikaže polje za 2FA kodo.
            throw new Error(TOTP_REQUIRED);
          }
          if (!verifyTotp(user.totpSecret, code, user.email ?? undefined)) {
            return null;
          }
        }

        return { id: user.id, name: user.username, email: user.email };
      },
    }),
    CredentialsProvider({
      id: "qr",
      name: "QR",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token?.trim();
        if (!token) return null;

        const reqRow = await prisma.loginRequest.findUnique({
          where: { token },
        });
        // Veljaven mora biti: odobren, neunovčen, nepotečen in vezan na uporabnika.
        if (
          !reqRow ||
          !reqRow.approved ||
          reqRow.consumed ||
          !reqRow.userId ||
          reqRow.expiresAt < new Date()
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { id: reqRow.userId },
        });
        if (!user) return null;

        // Enkratna uporaba: takoj označi kot unovčeno.
        await prisma.loginRequest.update({
          where: { id: reqRow.id },
          data: { consumed: true },
        });

        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Vrne trenutno admin sejo (ali null). Uporaba v API route handlerjih. */
export function getSession() {
  return getServerSession(authOptions);
}
