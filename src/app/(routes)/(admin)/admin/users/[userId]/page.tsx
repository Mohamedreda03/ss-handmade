"use client";

import AllUserData from "@/components/admin_user_dashboard/AllUserData";

export default function page({ params }: { params: { userId: string } }) {
  return (
    <div className="p-5 md:p-7">
      <AllUserData userId={params.userId} />
    </div>
  );
}
