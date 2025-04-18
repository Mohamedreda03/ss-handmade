import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      role: Role;
      device_id?: string;
    } & DefaultSession["user"];
  }
}

enum Role {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  CONSTRUCTOR = "CONSTRUCTOR",
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name: string;
    email: string;
    role: Role;
    device_id?: string;
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
        const { email, password } = credentials;

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // For Google authentication
        if (account && account.provider === "google") {
          // Check if user exists in the database
          const existingUser = await prisma.user.findFirst({
            where: {
              email: user.email!,
            },
          });

          if (!existingUser) {
            // Create a new user if they don't exist
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                role: "STUDENT",
              },
            });

            const deviceId = uuidv4();

            await prisma.session.create({
              data: {
                userId: newUser.id,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                device_id: deviceId,
              },
            });

            token.user = {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              device_id: deviceId,
            };
          } else {
            // User exists, create session
            const deviceId = uuidv4();

            await prisma.session.create({
              data: {
                userId: existingUser.id,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                device_id: deviceId,
              },
            });

            token.user = {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              device_id: deviceId,
            };
          }
        } else {
          // Regular credentials login
          const userData = await prisma.user.findUnique({
            where: {
              id: user.id,
            },
          });

          await prisma.session.deleteMany({
            where: {
              userId: user.id,
            },
          });

          const deviceId = uuidv4();

          await prisma.session.create({
            data: {
              userId: user.id!,
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              device_id: deviceId,
            },
          });

          token.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: userData?.role,
            device_id: deviceId,
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/",
  },
  trustHost: true,
} satisfies NextAuthConfig;
