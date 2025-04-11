"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "./ui/button";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TestsTable({
  lessonUserData,
  questionLength,
  lesson,
  courseId,
}: {
  lessonUserData: any[];
  questionLength: number;
  lesson: any;
  courseId: string;
}) {
  const router = useRouter();
  const endTest = async (testId: string) => {
    await axios.patch(`/api/lesson_user_data/test/${testId}/test_result`);
    toast.success("تم ارسال الاجابات بنجاح");
    router.refresh();
  };

  return (
    <Table dir="rtl" className="mb-8 border">
      <TableHeader>
        <TableRow>
          {/* <TableHead className="w-[100px] text-center">ID</TableHead> */}
          <TableHead className="text-center">تاريخ البدأ</TableHead>
          <TableHead className="text-center">اجمالي عدد الاسئلة </TableHead>
          <TableHead className="text-center">النتيجة</TableHead>
          <TableHead className="text-center">الاجابة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessonUserData.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-lg">
              لا يوجد بيانات
            </TableCell>
          </TableRow>
        )}
        {lessonUserData?.map((test) => (
          <TableRow key={test.id}>
            {/* <TableCell>{test.id}</TableCell> */}
            <TableCell className="font-medium text-center">
              {format(test.createdAt, "( hh:mm a ) ,eeee, d/ MM/ yyyy", {
                locale: ar,
              })}
            </TableCell>
            <TableCell className="text-center">{questionLength}</TableCell>
            <TableCell className="text-center">
              {!test.testResult ? 0 : test.testResult}
            </TableCell>
            {!test.isCompleted && (
              <div className="flex items-center justify-center">
                <TableCell className="text-left">
                  <Button
                    onClick={() => endTest(test.id)}
                    className="bg-blue-500 border border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-500"
                  >
                    انهاء الاختبار
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    className="bg-blue-500 border border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-500"
                  >
                    <Link href={`/course/test/${test.id}`}>
                      استكمال الاختبار
                    </Link>
                  </Button>
                </TableCell>
              </div>
            )}
            {test.isCompleted && (
              <TableCell className="text-center">
                <Button
                  asChild
                  className="bg-blue-500 border border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-500"
                >
                  <Link
                    href={`/course/test/${test.id}/answers?lessonId=${lesson.id}&courseId=${courseId}`}
                  >
                    عرض الاجابات
                  </Link>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
