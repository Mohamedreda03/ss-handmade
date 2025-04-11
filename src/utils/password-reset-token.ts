import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordTesetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    return passwordTesetToken;
  } catch (error) {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordTesetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
      },
    });

    return passwordTesetToken;
  } catch (error) {
    return null;
  }
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      token,
      email,
      expires,
    },
  });

  return passwordResetToken;
};
