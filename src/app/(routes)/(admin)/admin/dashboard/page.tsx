"use client";

import SubscriptionsCharts from "@/components/admin_dashboard/subcriptions/SubscriptionsCharts";
import CoursesDataTable from "@/components/admin_dashboard/tables/CoursesDataTable";
import Loading from "@/components/Loading";
import axios from "axios";
import { useQuery } from "react-query";

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["users", "courses"],
    queryFn: async () => {
      const data = await axios
        .get("/api/dashboard/dashboard_data")
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  if (!data) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="p-5">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 md:gap-6">
        <div className="border rounded-lg text-center">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-3">عدد الطلاب</h3>
            <p className="text-4xl font-semibold">{data?.usersCount || 0}</p>
          </div>
        </div>
        <div className="border rounded-lg text-center">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-3">عدد المشرفين</h3>
            <p className="text-4xl font-semibold">{data?.adminsCount || 0}</p>
          </div>
        </div>
        <div className="border rounded-lg text-center">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-3">عدد الكورسات</h3>
            <p className="text-4xl font-semibold">{data?.coursesCount || 0}</p>
          </div>
        </div>
      </div>
      <SubscriptionsCharts />
      <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 my-10" />
      <div>
        <div className="flex items-center justify-center">
          <h3 className="mb-4 text-2xl border-b-2 border-blue-500">
            بيانات الكورسات
          </h3>
        </div>
        <div>
          <CoursesDataTable />
        </div>
      </div>
    </div>
  );
}
