"use server";

import { signOut } from "@/auth";

export const signout = async () => {
  // مسح السلة سيتم عبر client-side بعد الاستدعاء
  await signOut({
    redirectTo: "/",
  });
};
