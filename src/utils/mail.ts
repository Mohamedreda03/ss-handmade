import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`;

  await resend.emails.send({
    from: "el-qema <onboarding@resend.dev>",
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
  });
};
