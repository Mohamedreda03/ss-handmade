import { auth } from "@/auth";
import DashboardMenu from "@/components/student_dashboard/DashboardMenu";
import DashboardHead from "@/components/student_dashboard/DashboardHead";
import { redirect } from "next/navigation";
import React from "react";
import { isAuth } from "@/actions/isAuth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAuth = await isAuth();

  if (!isUserAuth) {
    redirect("/");
  }

  return (
    <div className="px-5">
      {/* <div className="bg-gradient-to-l from-secondary to-secondary/40 w-full h-48 mt-5 rounded-lg"></div> */}
      <div className="w-full bg-white dark:bg-black rounded-lg mt-11 min-h-[500px] mx-auto p-5 border shadow-md py-10 mb-10">
        <DashboardHead />

        <div className="flex md:flex-row flex-col gap-10 mt-10 w-full">
          <DashboardMenu />
          <div className="flex-[1.6] w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
