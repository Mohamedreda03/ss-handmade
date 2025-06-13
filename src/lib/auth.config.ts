import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

import bcrypt from "bcryptjs";

import { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      async authorize(credentials: any) {
        try {
          const { email, password } = credentials;

          const user = await prisma.user.findFirst({
            where: {
              email,
            },
            include: {
              contractorProfile: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password!
          );

          if (!isPasswordValid) {
            return null;
          }

          // التحقق من حالة مُنسق إذا كان المستخدم مُنسق
          if (user.role === "CONSTRUCTOR") {
            if (!user.contractorProfile) {
              throw new Error("لم يتم العثور على ملف مُنسق الخاص بك");
            }

            const contractorStatus = user.contractorProfile.status;
            if (contractorStatus === "PENDING") {
              throw new Error("حسابك كمُنسق لا زال تحت المراجعة");
            }

            if (contractorStatus === "REJECTED") {
              throw new Error("تم رفض طلب التسجيل كمُنسق");
            }

            if (contractorStatus === "SUSPENDED") {
              throw new Error("تم تعليق حسابك كمُنسق مؤقتاً");
            }

            // السماح بالدخول فقط للمُنسق المقبول
            if (contractorStatus !== "APPROVED") {
              throw new Error("حالة الحساب غير صالحة");
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.user = {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          role: (user as any).role || "STUDENT",
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/",
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
