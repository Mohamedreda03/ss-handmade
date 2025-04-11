import FilterCorses from "@/components/admin_dashboard/courses/FilterCorses";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <div className="p-5">
      <div className="mt-5">
        <Button className="text-lg">
          <Link href="/admin/courses/new" className="flex items-center">
            <PlusCircle size={18} className="ml-2 text-white" />
            <span>اضافة دورة جديدة</span>
          </Link>
        </Button>
      </div>
      <div className="h-[1px] w-full bg-slate-200 my-5" />
      <Suspense fallback={<Loading className="h-96" />}>
        <FilterCorses />
      </Suspense>
    </div>
  );
}
