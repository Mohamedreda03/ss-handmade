import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <OrderDetailClient orderId={params.orderId} userId={session.user.id} />
  );
}
