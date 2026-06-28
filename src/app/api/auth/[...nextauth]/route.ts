import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { config } from "@/config";
import { cookies } from "next/headers";
import { getUserByEmailOrID } from "@/services/user.service";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: config().Google_Client_ID!,
      clientSecret: config().Google_Client_Secret!,
    }),
    GitHubProvider({
      clientId: config().Github_Client_ID!,
      clientSecret: config().Github_Client_Secret!,
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: { scope: "read:user user:email" },
      },
    }),
  ],

  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }) {
      try {
        const provider = account?.provider;
        const providerToken = account?.access_token;
        const existingUser = await getUserByEmailOrID(user.email as string);

        // Auto-register if user doesn’t exist
        if (!existingUser?.data && user?.email && providerToken) {
          const registerEndpoint =
            provider === "google"
              ? `${config().Backend_URL}/auth/login-through-google`
              : `${config().Backend_URL}/auth/login-through-github`;

          await fetch(registerEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${providerToken}`,
            },
            body: JSON.stringify({ authProvider: provider }),
          });
        }
        return true;
      } catch (err) {
        console.error("OAuth sign-in error:", err);
        // ❗ Do NOT return false here – it blocks the sign-in.
        // Instead, log the error and allow the sign-in to proceed.
        return true;
      }
    },

    async jwt({ token, account, user }) {
      try {
        if (account && user?.email) {
          const provider = account.provider;
          const providerToken = account.access_token;
          const loginUrl =
            provider === "google"
              ? `${config().Backend_URL}/auth/login-through-google`
              : `${config().Backend_URL}/auth/login-through-github`;

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${providerToken}`,
            },
            // If the backend expects a body, add it.
            // body: JSON.stringify({ authProvider: provider }),
          });

          if (!response.ok) {
            console.error(
              `Backend login failed: ${response.status} ${response.statusText}`,
            );
            const text = await response.text();
            console.error("Response body:", text);
            return token; // Return token without adding accessToken
          }

          const data = await response.json();
          console.log("Backend login response:", data);

          if (data?.data?.accessToken && data?.data?.refreshToken) {
            token.accessToken = data.data.accessToken;
            token.refreshToken = data.data.refreshToken;

            // Set cookies – wrap in try-catch to avoid breaking the flow
            try {
              const cookieStore = await cookies();
              cookieStore.set("accessToken", data.data.accessToken);
              cookieStore.set("refreshToken", data.data.refreshToken);
            } catch (cookieErr) {
              console.error("Error setting cookies:", cookieErr);
            }
          }
        }
        return token;
      } catch (err) {
        console.error("JWT callback error:", err);
        return token;
      }
    },

    async session({ session, token }) {
      // Optionally attach token data to session
      session.user = {
        ...session.user,

        accessToken: token.accessToken,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
