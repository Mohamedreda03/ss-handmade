"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { BadgeCheck, BadgeInfo, Grip, Pencil, PlusCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "@/hooks/use-toast";

interface Chapter {
  _id: string;
  title: string;
  isPublished: boolean;
  courseId: string;
}

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على 2 حرف على الأقل",
  }),
  type: z.string().min(1, {
    message: "يجب أن تختار نوع الدرس",
  }),
});

export default function EditLessons({
  courseId,
  chapterId,
  items,
}: {
  courseId: string;
  chapterId: string;
  items: any[];
}) {
  const [isAdd, setIsAdd] = useState(false);
  const [lessons, setLessons] = useState(items);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    await axios
      .post(`/api/courses/${courseId}/chapters/${chapterId}/lessons`, {
        ...data,
        courseId,
      })
      .then((res) => {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم اضافة الدرس بنجاح</span>
            </div>
          ),
        });
        setLessons([...lessons, res.data]);
        form.reset();
        setIsAdd(false);
      })
      .catch((error) => {
        console.log("error while adding lesson", error);
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeInfo size={18} className="mr-2 text-red-500" />
              <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
            </div>
          ),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updateLessons = items.slice(startIndex, endIndex + 1);

    setLessons(items);

    const bulkUpdateData = updateLessons.map((lesson, index) => ({
      ...lesson,
      position: items.findIndex((item) => item.id === lesson.id),
    }));

    onRecord(bulkUpdateData);
  };

  const onRecord = async (updateData: { id: string; position: number }[]) => {
    await axios
      .patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/reorder`,
        updateData
      )
      .then(() => {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم تعديل ترتيب الدرس بنجاح</span>
            </div>
          ),
        });
        // router.refresh();
      })
      .catch((error) => {
        console.log("error while updating chapters", error);
        toast({
          variant: "destructive",
          description: (
            <div className="flex items-center gap-3">
              <BadgeInfo size={18} className="mr-2 text-red-500" />
              <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
            </div>
          ),
        });
      });
  };

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 mb-3">الدرس</p>
          <div>
            {!isAdd && (
              <Button
                onClick={() => setIsAdd(true)}
                className="flex items-center justify-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>اضافة الدرس</span>
              </Button>
            )}
          </div>
        </div>
        {isAdd ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="عنوان الدرس"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        dir="rtl"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="أختر نوع الدرس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">فيديو</SelectItem>
                          <SelectItem value="file">ملف</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري الاضافة..." : "اضافة الدرس"}
              </Button>
              <Button
                variant="outline"
                className="mr-3"
                disabled={isLoading}
                onClick={() => setIsAdd(false)}
              >
                الغاء
              </Button>
            </form>
          </Form>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="chapters">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {lessons.map((lesson, index) => (
                    <Draggable
                      key={lesson.id}
                      draggableId={lesson.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className={cn(
                            "flex items-center gap-x-2 bg-slate-200 border border-slate-200 text-slate-700 rounded-md mb-4 text-sm",
                            lesson.isPublished &&
                              "bg-green-100 border-green-200 text-green-700"
                          )}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            className={cn(
                              "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-md transition",
                              lesson.isPublished &&
                                "border-r-sky-200 hover:bg-sky-200"
                            )}
                            {...provided.dragHandleProps}
                          >
                            <Grip className="h-5 w-5" />
                          </div>
                          {lesson.title}
                          <Badge
                            className={cn("mr-auto ml-1", {
                              "text-white": lesson.isPublished,
                            })}
                            variant={lesson.isPublished ? "success" : "default"}
                          >
                            {lesson.isPublished ? "تم النشر" : "غير منشور"}
                          </Badge>
                          <Link
                            href={`/admin/courses/${courseId}/${chapterId}/${lesson.id}`}
                          >
                            <Pencil className="h-5 w-5 cursor-pointer ml-4" />
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
