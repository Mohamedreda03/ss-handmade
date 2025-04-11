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
import ActionButton from "../ActionButton";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "react-query";

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على 2 حرف على الأقل",
  }),
});

export default function EditChapters({
  courseId,
  items,
}: {
  courseId: string;
  items: any[];
}) {
  const [isAdd, setIsAdd] = useState(false);
  const [chapters, setChapters] = useState(items);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const res = await axios.post(`/api/courses/${courseId}/chapters`, data);
      setChapters([...chapters, res.data]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);

      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم اضافة الفصل بنجاح</span>
          </div>
        ),
      });

      form.reset();
      setIsAdd(false);
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
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await mutateAsync(data);
  }

  const { mutateAsync: mutateReorder, isLoading: isReorderLoading } =
    useMutation({
      mutationFn: async (data: { id: string; position: number }[]) => {
        await axios.patch(`/api/courses/${courseId}/chapters/reorder`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["courses"]);

        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم تعديل ترتيب الفصول بنجاح</span>
            </div>
          ),
        });
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
      },
    });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updateChapters = items.slice(startIndex, endIndex + 1);

    setChapters(items);

    const bulkUpdateData = updateChapters.map((chapter, index) => ({
      ...chapter,
      position: items.findIndex((item) => item.id === chapter.id),
    }));

    onRecord(bulkUpdateData);
  };

  const onRecord = async (updateData: { id: string; position: number }[]) => {
    await mutateReorder(updateData);
  };

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5 shadow-sm">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 mb-3">الفصول</p>

          <Button
            onClick={() => setIsAdd(true)}
            className="flex items-center justify-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>اضافة فصل</span>
          </Button>
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
                      <Input placeholder="عنوان الفصل" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <ActionButton
                type="submit"
                title="أصافة"
                loadingTitle="جاري الاضافة"
                isLoading={isLoading}
              />

              <Button
                variant="outline"
                className="mr-3"
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
                  {chapters.map((chapter, index) => (
                    <Draggable
                      key={chapter.id}
                      draggableId={chapter.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className={cn(
                            "flex items-center gap-x-2 bg-slate-200 border border-slate-200 text-slate-700 rounded-md mb-4 text-sm",
                            chapter.isPublished &&
                              "bg-green-100 border-green-200 text-green-700"
                          )}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            className={cn(
                              "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-md transition",
                              chapter.isPublished &&
                                "border-r-sky-200 hover:bg-sky-200"
                            )}
                            {...provided.dragHandleProps}
                          >
                            <Grip className="h-5 w-5" />
                          </div>
                          {chapter.title}
                          <Badge
                            className={cn("mr-auto ml-1", {
                              "text-white": chapter.isPublished,
                            })}
                            variant={
                              chapter.isPublished ? "success" : "default"
                            }
                          >
                            {chapter.isPublished ? "تم النشر" : "غير منشور"}
                          </Badge>
                          <Link
                            href={`/admin/courses/${courseId}/${chapter.id}`}
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
