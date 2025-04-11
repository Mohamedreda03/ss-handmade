"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  FileUserData,
  Lesson,
  TestUserData,
  VideoUserData,
} from "@prisma/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import DeleteTestDataModel from "./DeleteTestDataModel";
import axios from "axios";

interface UserTestsAndSheetsTableProps {
  lesson: Lesson & {
    FileUserData: FileUserData[];
    VideoUserData: VideoUserData[];
    TestUserData: TestUserData[];
    _count: {
      testQuestions: number;
    };
  };
}

export default function UserTestsAndSheetsTable({
  lesson,
}: UserTestsAndSheetsTableProps) {
  const queryClient = useQueryClient();
  const [deleteTestId, setDeleteTestId] = useState("");

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin_user_test/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userChapterLessons"]);
    },
  });

  const handleDelete = async (id: string) => {
    setDeleteTestId(id);
    await mutateAsync(id);
    setDeleteTestId("");
  };

  return (
    <Table dir="rtl" className="mb-8 border">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">تاريخ البدأ</TableHead>
          <TableHead className="text-center">اجمالي عدد الاسئلة </TableHead>
          <TableHead className="text-center">النتيجة</TableHead>
          {lesson?.type === "sheet" && (
            <TableHead className="text-center">الحاله</TableHead>
          )}
          <TableHead className="text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lesson?.TestUserData?.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-lg">
              لا يوجد بيانات
            </TableCell>
          </TableRow>
        )}

        {lesson?.TestUserData?.map((test) => (
          <TableRow key={test?.id}>
            <TableCell className="font-medium text-center">
              {format(test?.createdAt, "( hh:mm a ) ,eeee, d/ MM/ yyyy", {
                locale: ar,
              })}
            </TableCell>
            <TableCell className="text-center">
              {lesson?._count?.testQuestions}
            </TableCell>
            <TableCell className="text-center">{test?.testResult}</TableCell>
            {lesson?.type === "sheet" && (
              <TableCell className="text-center">
                {test?.userShowAnswers ? "رأى الإجابات" : "لم يرَ الإجابات"}
              </TableCell>
            )}
            <TableCell className="text-center">
              <DeleteTestDataModel
                onDelete={() => handleDelete(test?.id)}
                isLoading={deleteTestId === test?.id}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
