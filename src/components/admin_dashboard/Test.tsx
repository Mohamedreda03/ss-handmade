"use client";

import { LoaderCircle, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import EditQuestion from "./EditQuestion";
import AddQuestion from "./AddQuestion";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Answers } from "@prisma/client";
import { useMutation, useQueryClient } from "react-query";
import TestModel from "../admin_test_models/TestModel";
import AddTestModel from "../admin_test_models/AddTestQuestionModel";
import AddTestQuestionModel from "../admin_test_models/AddTestQuestionModel";
import EditTestQuestionModel from "../admin_test_models/EditTestQuestionModel";
import { deleteImageFromSupabase } from "@/utils/uploadToSupabase";

function TestComponent({
  courseId,
  chapterId,
  lessonId,
  lesson,
}: {
  courseId: string;
  chapterId: string;
  lessonId: string;
  lesson: any;
}) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [type, setType] = useState<"edit" | "create" | null>(null);
  const [isDeletingQuestionId, setIsDeletingQuestionId] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/test/${id}`
      );
    },
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح");
      queryClient.invalidateQueries("lessons");
    },
  });

  const deleteImage = async (url: string) => {
    await deleteImageFromSupabase(url);
  };

  const onDelete = async (id: string) => {
    // delete the question images

    setIsDeletingQuestionId(id);

    const question = lesson.testQuestions.find((q: any) => q.id === id);

    if (question.image_url) {
      await deleteImage(question.image_url);
    }

    if (question.answers) {
      question.answers.forEach(async (ans: any) => {
        if (ans.image_url) {
          await deleteImage(ans.image_url);
        }
      });
    }

    if (question.explanation_image) {
      await deleteImage(question.explanation_image);
    }

    await mutateAsync(id);

    setIsDeletingQuestionId("");
  };

  return (
    <div className="border border-secondary/50 dark:border-secondary/40 p-5 rounded-lg">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl">الاختبار</h2>
        <div>
          {type !== "create" && (
            <Button onClick={() => setIsAddOpen(true)}>
              <PlusCircle className="h-4 w-4 ml-1" />
              <span>أضف سؤال</span>
            </Button>
          )}
        </div>
      </div>

      <AddTestQuestionModel
        isAddOpen={isAddOpen}
        courseId={courseId}
        chapterId={chapterId}
        lessonId={lessonId}
        setIsOpen={setIsAddOpen}
      />

      <EditTestQuestionModel
        isAddOpen={isEditOpen}
        courseId={courseId}
        chapterId={chapterId}
        lessonId={lessonId}
        setIsOpen={setIsEditOpen}
        currentQuestion={currentQuestion}
      />

      <div className="mt-5">
        <h3 className="text-2xl w-fit border-b-2">الأسئلة</h3>
        <div className="divide-y">
          {lesson.testQuestions.map((question: any, index: number) => (
            <div className="py-5" key={question.id}>
              <div className="flex items-center justify-between gap-3">
                {/* question test and image */}
                <div className="flex flex-col gap-3">
                  {question.image_url && (
                    <Image
                      src={question.image_url}
                      width={250}
                      height={250}
                      className="rounded-lg"
                      alt="question"
                    />
                  )}
                  <div className="flex items-center gap-3 text-xl">
                    <span className="border-b-2 border-secondary px-2">
                      {index + 1}
                    </span>
                    {/* <span>{question.question}</span> */}
                    {question.question && (
                      <div
                        className="html-content"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      setCurrentQuestion(question);
                      setIsEditOpen(true);
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    disabled={isDeletingQuestionId === question.id}
                    onClick={() => onDelete(question.id)}
                    variant="outline"
                  >
                    {isDeletingQuestionId === question.id
                      ? "جاري الحذف..."
                      : "حذف"}
                    {isDeletingQuestionId === question.id && (
                      <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 ml-8 text-lg flex flex-col gap-4">
                {question.answers.map((ans: Answers) => (
                  <div
                    key={ans.id}
                    className={cn("flex items-center gap-2 w-fit p-3", {
                      "text-green-500 border border-green-500 rounded-lg":
                        ans.index! === question.currectAnswer,
                    })}
                  >
                    <span>{ans.index!}</span>
                    <span>-</span>
                    <div className="flex flex-col gap-2">
                      {ans.answer && (
                        <div
                          className="html-content"
                          dangerouslySetInnerHTML={{ __html: ans.answer! }}
                        />
                      )}
                      {ans.image_url && (
                        <Image
                          src={ans.image_url}
                          width={250}
                          height={250}
                          alt="answer"
                          className="rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div>
                  {(question.explanation_text ||
                    question.explanation_image) && (
                    <h3 className="text-lg border-b w-fit">تفسير السؤال</h3>
                  )}
                </div>

                {question?.explanation_text && (
                  <div
                    className="html-content text-black dark:text-white my-2"
                    dangerouslySetInnerHTML={{
                      __html: question?.explanation_text,
                    }}
                  />
                )}
                {question?.explanation_image && (
                  <Image
                    src={question?.explanation_image}
                    width={250}
                    height={250}
                    alt="explanation"
                    className="rounded-lg mt-3"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestComponent;
