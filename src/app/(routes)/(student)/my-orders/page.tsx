import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MyOrdersClient from "./MyOrdersClient";

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <MyOrdersClient />;
}
