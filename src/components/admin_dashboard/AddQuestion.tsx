"use client";

import {
  BadgeCheck,
  BadgeInfo,
  PlusCircle,
  Trash,
  Upload,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useReducer,
  useState,
} from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "react-query";
import { Input } from "../ui/input";
import Image from "next/image";
import QuillEditor from "../QuillEditor";
import { Label } from "../ui/label";
import {
  initialQuestionState,
  QuestionStateType,
  reducerQuestion,
} from "../admin_test_models/questionState";
import { uploadImageToSupabase } from "@/utils/uploadToSupabase";

export default function AddQuestion({
  courseId,
  chapterId,
  lessonId,
  setIsOpen,
}: {
  courseId: string;
  chapterId: string;
  lessonId: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [state, dispatch] = useReducer(reducerQuestion, initialQuestionState);

  const queryClient = useQueryClient();

  const [error, setError] = useState<{
    position: "question" | "answers" | "currectAnswer";
    message: string;
  } | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: any) => {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/test`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("lessons");

      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم اضافة السؤال بنجاح.</span>
          </div>
        ),
      });

      // reset state
      dispatch({ type: "RESET" });

      setIsOpen(false);
      setIsLoading(false);
    },
    onError: () => {
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
          </div>
        ),
      });
      setIsLoading(false);
    },
  });

  const upladImage = async (file: File) => {
    return await uploadImageToSupabase(file);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (state.question.question.length < 2 && !state.question.image) {
      setError({
        position: "question",
        message: "الرجاء ادخال السؤال",
      });
      setIsLoading(false);
      return;
    }

    if (
      state.answer.some((ans: any) => !ans.answer) &&
      state.answer.some((ans: any) => !ans.image)
    ) {
      setError({
        position: "answers",
        message: "الرجاء ادخال جميع الخيارات",
      });
      setIsLoading(false);
      return;
    }

    if (state.currectAnswer < 1 || state.currectAnswer > state.answer.length) {
      setError({
        position: "currectAnswer",
        message: "الرجاء ادخال الإجابة الصحيحة",
      });
      setIsLoading(false);
      return;
    }

    try {
      const uploadPromises = [];

      if (state.answer.some((ans: any) => ans.image)) {
        for (let i = 0; i < state.answer.length; i++) {
          if (state.answer[i].image) {
            uploadPromises.push(
              upladImage(state.answer[i].image as File).then((url) => {
                state.answer[i].image_url = url;
              })
            );
          }
        }
      }

      if (state.question.image) {
        uploadPromises.push(
          upladImage(state.question.image).then((url) => {
            state.question.image_url = url;
          })
        );
      }

      if (state.explanation.explanation_file) {
        uploadPromises.push(
          upladImage(state.explanation.explanation_file).then((url) => {
            state.explanation.explanation_image = url;
          })
        );
      }

      await Promise.all(uploadPromises);

      const data = {
        question: {
          question: state.question.question,
          image_url: state.question.image_url,
        },
        answers: state.answer.map((ans: any) => ({
          answer: ans.answer,
          image_url: ans.image_url,
          index: ans.index,
        })),
        currectAnswer: state.currectAnswer,
        explanation_text: state.explanation.explanation_text,
        explanation_image: state.explanation.explanation_image,
      };

      await mutateAsync(data);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const AddQuestionImage = (e: ChangeEvent<HTMLInputElement>) => {
    // setQuestion((prev) => ({
    //   ...prev,
    //   image: e.target.files![0],
    //   image_url: URL.createObjectURL(e.target.files![0]),
    // }));
    dispatch({
      type: "UPDATE_QUESTION",
      payload: {
        ...state.question,
        image: e.target.files![0],
        image_url: URL.createObjectURL(e.target.files![0]),
      },
    });
  };

  const AddQuestionText = (value: string) => {
    if (error?.position === "question") {
      setError(null);
    }
    // setQuestion((prev) => ({ ...prev, question: value }));
    dispatch({
      type: "UPDATE_QUESTION",
      payload: { ...state.question, question: value },
    });
  };

  const AddAnswerText = (value: string, ans: any) => {
    if (error?.position === "answers") {
      setError(null);
    }
    // setAnswer((prev) => {
    //   return prev.map((a) =>
    //     a.index === ans.index ? { ...a, answer: value } : a
    //   );
    // });
    dispatch({
      type: "UPDATE_ANSWER",
      payload: state.answer.map((a: any) =>
        a.index === ans.index ? { ...a, answer: value } : a
      ),
    });
  };

  const AddAnswerImage = (file: File, ans: any) => {
    // setAnswer((prev) => {
    //   return prev.map((a) =>
    //     a.index === ans.index
    //       ? {
    //           ...a,
    //           image: file,
    //           image_url: URL.createObjectURL(file),
    //         }
    //       : a
    //   );
    // });
    dispatch({
      type: "UPDATE_ANSWER",
      payload: state.answer.map((a: any) =>
        a.index === ans.index
          ? {
              ...a,
              image: file,
              image_url: URL.createObjectURL(file),
            }
          : a
      ),
    });
  };

  const AddNewAnswer = (e: MouseEvent<HTMLButtonElement>) => {
    if (error?.position === "answers") {
      setError(null);
    }
    // setAnswer((prev) => {
    //   return [
    //     ...prev,
    //     {
    //       index: prev.length + 1,
    //       answer: "",
    //       image: null,
    //       image_url: "",
    //     },
    //   ];
    // });
    dispatch({
      type: "UPDATE_ANSWER",
      payload: [
        ...state.answer,
        {
          index: state.answer.length + 1,
          answer: "",
          image: null,
          image_url: "",
        },
      ],
    });
  };

  const AddCurrectAnswer = (e: ChangeEvent<HTMLInputElement>) => {
    if (error?.position === "currectAnswer") {
      setError(null);
    }
    // setCurrectAnswer(parseInt(e.target.value));
    dispatch({
      type: "UPDATE_CORRECT_ANSWER",
      payload: parseInt(e.target.value),
    });
  };

  const handleDeleteAnswer = (index: number) => {
    const updatedAnswers = state.answer.filter(
      (answer: any) => answer.index !== index
    );

    const reorderedAnswers = updatedAnswers.map(
      (answer: any, index: number) => ({
        ...answer,
        index: index + 1,
      })
    );

    // setAnswer(reorderedAnswers);
    dispatch({
      type: "UPDATE_ANSWER",
      payload: reorderedAnswers,
    });
  };

  const AddExplanationText = (value: string) => {
    // setExplanation((prev) => ({ ...prev, explanation_text: value }));
    dispatch({
      type: "UPDATE_EXPLANATION",
      payload: { ...state.explanation, explanation_text: value },
    });
  };

  const AddExplanationImage = (file: File) => {
    // setExplanation((prev) => ({
    //   ...prev,
    //   explanation_image: file ? URL.createObjectURL(file) : "",
    //   explanation_file: file ? file : null,
    // }));
    dispatch({
      type: "UPDATE_EXPLANATION",
      payload: {
        ...state.explanation,
        explanation_image: file ? URL.createObjectURL(file) : "",
        explanation_file: file ? file : null,
      },
    });
  };

  return (
    <div>
      <h3 className="text-lg">أضف سؤال</h3>
      <div className="mt-3 relative">
        <label>السؤال</label>
        <div className="flex flex-col gap-4">
          <QuillEditor
            value={state.question.question}
            onChange={AddQuestionText}
          />

          {/* error message */}
          {error?.position === "question" && (
            <div className="absolute text-sm text-red-500">{error.message}</div>
          )}

          <div className="flex gap-5">
            <Input
              type="file"
              accept="image/*"
              className="w-fit"
              disabled={isLoading}
              onChange={AddQuestionImage}
            />
            {state.question.image_url && (
              <Image
                src={state.question.image_url}
                alt="question"
                height={200}
                width={150}
                className="object-cover rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex gap-3 items-center">
          <label>الخيارات</label>
          {error?.position === "answers" && (
            <div className="text-sm text-red-500">{error.message}</div>
          )}
        </div>
        {state.answer.map((ans: any) => (
          <div
            className="mt-1 flex items-center border py-2 rounded-lg"
            key={ans.index}
          >
            <span className="pr-3 pl-5 text-lg">{ans.index}</span>
            <div className="w-full flex flex-col gap-2 pl-3">
              <QuillEditor
                value={ans.answer}
                onChange={(value) => AddAnswerText(value, ans)}
              />
              <div className="flex gap-5">
                <Input
                  type="file"
                  accept="image/*"
                  className="w-fit"
                  disabled={isLoading}
                  onChange={(e) => AddAnswerImage(e.target.files![0], ans)}
                />
                {ans.image_url && (
                  <Image
                    src={ans.image_url}
                    alt="question"
                    height={150}
                    width={150}
                    className="object-cover rounded-lg"
                  />
                )}

                <Button
                  onClick={() => handleDeleteAnswer(ans.index)}
                  disabled={isLoading}
                  variant="destructive"
                  className="mr-auto"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-2">
          <Button
            disabled={isLoading}
            className="max-w-xs w-full flex items-center justify-center gap-2"
            onClick={AddNewAnswer}
          >
            <PlusCircle className="h-4 w-4" />
            <span>أضف خيار</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 relative">
        <label>الإجابة الصحيحة</label>
        <input
          value={state.currectAnswer === 0 ? "" : state.currectAnswer}
          onChange={AddCurrectAnswer}
          disabled={isLoading}
          type="number"
          className="border border-secondary/50 dark:border-secondary/25 py-2 px-4 w-full rounded-lg mt-1 outline-none"
        />
        {error?.position === "currectAnswer" && (
          <div className="absolute text-sm text-red-500">{error.message}</div>
        )}
      </div>

      {/* explanation */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>التفسير</Label>
          <QuillEditor
            value={state.explanation.explanation_text}
            onChange={(value) => AddExplanationText(value)}
          />
        </div>
        <div className="flex gap-5">
          <Input
            type="file"
            accept="image/*"
            className="w-fit"
            disabled={isLoading}
            onChange={(e) => AddExplanationImage(e.target.files![0])}
          />
          {state.explanation.explanation_image && (
            <div className="relative">
              <Image
                src={state.explanation.explanation_image}
                alt="explanation"
                height={150}
                width={150}
                className="object-cover rounded-lg"
              />
              <div>
                <X
                  className="h-6 w-6 absolute top-2 left-2 cursor-pointer rounded-full border"
                  onClick={() => {
                    // setExplanation((prev) => ({
                    //   ...prev,
                    //   explanation_image: "",
                    //   explanation_file: null,
                    // }));
                    dispatch({
                      type: "UPDATE_EXPLANATION",
                      payload: {
                        ...state.explanation,
                        explanation_image: "",
                        explanation_file: null,
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={onSubmit} disabled={isLoading}>
          <PlusCircle className="h-4 w-4 ml-1" />
          <span>أضف السؤال</span>
        </Button>
        <Button
          disabled={isLoading}
          className="ml-3"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}
