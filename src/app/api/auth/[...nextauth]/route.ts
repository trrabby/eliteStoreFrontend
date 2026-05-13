import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { config } from "@/config";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/services/user.service";

// ✅ Extend types
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
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
  session: {
    strategy: "jwt",
  },

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

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // STEP 1️⃣ Handle sign-in (Google/GitHub)
    async signIn({ user, account }) {
      try {
        const provider = account?.provider;
        const providerToken = account?.access_token;
        // console.log(
        //   "SIGNIN PROVIDER:",
        //   provider,
        //   "TOKEN:",
        //   providerToken,
        //   "user",
        //   user
        // );

        const existingUser = await getUserByEmail(user.email as string);

        // Auto-register if user doesn’t exist
        if (!existingUser?.data && user?.email && providerToken) {
          let registerEndpoint = "";

          if (provider === "google") {
            registerEndpoint = `${
              config().Backend_URL
            }/auth/login-through-google`;
          } else if (provider === "github") {
            registerEndpoint = `${
              config().Backend_URL
            }/auth/login-through-github`;
          }

          await fetch(registerEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${providerToken}`,
            },
            body: JSON.stringify({
              authProvider: provider,
            }),
          });
        }

        return true;
      } catch (err) {
        console.error("OAuth sign-in error:", err);
        return false;
      }
    },

    // STEP 2️⃣ After sign-in, issue backend tokens and store in cookies
    async jwt({ token, account, user }) {
      try {
        if (account && user?.email) {
          const provider = account.provider;
          const providerToken = account.access_token;
          let loginUrl = "";

          if (provider === "google") {
            loginUrl = `${config().Backend_URL}/auth/login-through-google`;
          } else if (provider === "github") {
            loginUrl = `${config().Backend_URL}/auth/login-through-github`;
          }

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              Authorization: `${providerToken}`,
            },
          });

          const data = await response.json();
          console.log("Login response from backend:", data);

          if (data?.data?.accessToken && data?.data?.refreshToken) {
            token.accessToken = data.data.accessToken;
            token.refreshToken = data.data.refreshToken;

            const cookieStore = await cookies();
            cookieStore.set("accessToken", data.data.accessToken);
            cookieStore.set("refreshToken", data.data.refreshToken);
          }
        }

        return token;
      } catch (err) {
        console.error("JWT callback error:", err);
        return token;
      }
    },

    // STEP 3️⃣ Expose tokens to session (optional, frontend use)
    async session({ session }) {
      session.user = {
        ...session.user,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
