import UsersTable from "@/components/admin_dashboard/UsersTable";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-5 md:p-10">
      <UsersTable currentUserId={session.user.id} />
    </div>
  );
}
