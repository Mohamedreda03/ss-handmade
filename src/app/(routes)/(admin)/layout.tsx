import AdminHeader from "@/components/AdminHeader";
import Sidebar from "@/components/Sidebar";
import "./admin.css";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div>
      <AdminHeader />
      <Sidebar role={session?.user.role!} />
      <div className="lg:pr-60">{children}</div>
    </div>
  );
}
