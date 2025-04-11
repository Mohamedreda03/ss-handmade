"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ReactPlayer from "react-player";
import VimeoPlayer from "../VimeoPlayer";
import {
  getUploadVimeoLink,
  updateVimeoVideoTitle,
} from "@/utils/getUploadVimeoLink";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "react-query";
import { SecureVideoPlayer } from "../SecureVideoPlayer";

export default function UploadVideo({
  video,
  courseId,
  chapterId,
  lesson,
  lessonVideoType,
  videoId,
}: {
  video: string;
  courseId: string;
  chapterId: string;
  lesson: any;
  lessonVideoType: "youtube" | "vimeo";
  videoId?: string;
}) {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [videoType, setVideoType] = useState<"youtube" | "vimeo">(
    lessonVideoType || "vimeo"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vid, setVid] = useState<{
    url: string;
    file: File | null;
    videoId: string;
  }>({
    url: "",
    file: null,
    videoId: "",
  });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      if (videoType === "youtube") {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`,
          {
            videoId: vid.videoId,
            video_type: "youtube",
            videoUrl: "",
          }
        );
      }

      if (videoType === "vimeo") {
        const formData = new FormData();
        formData.append("file", vid.file!);

        const links = await getUploadVimeoLink(formData);

        await axios({
          method: "PATCH",
          url: links.uploadLink,
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": "0",
            "Content-Type": "application/offset+octet-stream",
          },
          data: vid.file,
          onUploadProgress: (event) => {
            const percentage = Math.round((event.loaded * 100) / event.total!);
            setUploadProgress(percentage);
          },
        });

        await updateVimeoVideoTitle(links.videoLink, lesson.title);

        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`,
          {
            videoUrl: links.videoLink,
            video_type: "vimeo",
            videoId: "",
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("lessons");
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تحديث الفيديو بنجاح</span>
          </div>
        ),
      });
      // router.refresh();
      setIsEditing(false);
      setUploadProgress(null);
      setIsLoading(false);
    },
  });

  if (!isMounted) return null;

  async function onSubmit() {
    setIsLoading(true);

    await mutateAsync();
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 mb-3">الفيديو</p>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
        {isEditing ? (
          <div>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center justify-center gap-3 border p-2 rounded-lg border-secondary/50">
                <Button
                  variant={videoType === "vimeo" ? "secondary" : "outline"}
                  onClick={() => {
                    setVideoType("vimeo");
                    setVid({ url: "", file: null, videoId: "" });
                  }}
                >
                  vimeo
                </Button>
                <Button
                  variant={videoType === "youtube" ? "secondary" : "outline"}
                  onClick={() => {
                    setVideoType("youtube");
                    setVid({ url: "", file: null, videoId: "" });
                  }}
                >
                  youtube
                </Button>
              </div>
            </div>
            {videoType === "youtube" && (
              <Input
                placeholder="Youtube Video ID"
                value={vid.videoId}
                className="mb-5"
                onChange={(e) =>
                  setVid({ url: "", file: null, videoId: e.target.value })
                }
              />
            )}

            <input
              type="file"
              className="hidden"
              accept="video/*"
              ref={inputRef}
              onChange={(e) => {
                setVid({
                  url: URL.createObjectURL(e.target.files![0]),
                  file: e.target.files![0],
                  videoId: "",
                });
              }}
            />

            {vid.url.length > 0 && (
              <div className="flex items-center justify-center">
                <ReactPlayer url={vid.url} controls={true} />
              </div>
            )}

            {videoType === "youtube" && vid.videoId && (
              <SecureVideoPlayer videoId={vid.videoId} />
            )}

            {uploadProgress !== null && (
              <div className="mb-4 mt-2 flex gap-4">
                <span>{uploadProgress.toFixed(0)}%</span>
                <div className="border w-full h-3 flex items-start rounded-full overflow-hidden">
                  <span
                    className={`h-[22px] bg-green-500`}
                    style={{ width: `${uploadProgress}%` }}
                  ></span>
                </div>
              </div>
            )}

            {videoType === "vimeo" && (
              <Button
                onClick={() => inputRef.current?.click()}
                variant="outline"
                className="w-60 mb-5 mt-3"
                disabled={isLoading}
              >
                <Upload size={15} className="ml-2" />
                اختر الفيديو
              </Button>
            )}
            <div className="mt-4">
              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? "جاري رفع الفيديو..." : "حفظ"}
              </Button>
              <Button
                variant="outline"
                className="mr-3 "
                onClick={() => setIsEditing(false)}
              >
                الغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {video || videoId ? (
              <div className="relative w-full mt-4">
                {lessonVideoType === "youtube" && videoId && (
                  <SecureVideoPlayer videoId={videoId} />
                )}
                {video && lessonVideoType === "vimeo" && (
                  <div className="aspect-video">
                    <VimeoPlayer videoUrl={video} />
                  </div>
                )}
              </div>
            ) : (
              <p>لا يوجد فيديو</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
