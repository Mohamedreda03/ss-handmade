"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "react-query";
import { SecureVideoPlayer } from "../SecureVideoPlayer";

export default function UploadVideo({
  video,
  courseId,
  chapterId,
  lesson,
  videoId,
}: {
  video: string;
  courseId: string;
  chapterId: string;
  lesson: any;
  videoId?: string;
}) {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    setIsMounted(true);
    // If there's an existing videoId, set it and construct the YouTube URL
    if (videoId) {
      setYoutubeVideoId(videoId);
      setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`);
    }
  }, [videoId]);

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      const videoIdToSend = extractVideoId(youtubeUrl);
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`,
        {
          videoId: videoIdToSend,
          videoUrl: "",
        }
      );
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
      setIsLoading(false);
      setIsEditing(false);
    },
  });

  if (!isMounted) return null;
  async function onSubmit() {
    if (!youtubeUrl.trim()) {
      toast({
        variant: "destructive",
        description: "يرجى إدخال رابط الفيديو من YouTube",
      });
      return;
    }

    const videoIdToUse = extractVideoId(youtubeUrl);
    if (!videoIdToUse) {
      toast({
        variant: "destructive",
        description:
          "رابط YouTube غير صحيح. يرجى التأكد من الرابط والمحاولة مرة أخرى",
      });
      return;
    }

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
        </div>{" "}
        {isEditing ? (
          <div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                رابط الفيديو من YouTube
              </label>
              <Input
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID أو https://youtu.be/VIDEO_ID"
                value={youtubeUrl}
                className="mb-5"
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  // Auto-extract video ID when URL is entered
                  if (e.target.value.trim()) {
                    const extractedId = extractVideoId(e.target.value);
                    if (extractedId) {
                      setYoutubeVideoId(extractedId);
                    }
                  }
                }}
              />
            </div>

            {youtubeVideoId && (
              <div className="mb-4">
                <SecureVideoPlayer videoId={youtubeVideoId} />
              </div>
            )}

            <div className="mt-4">
              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                variant="outline"
                className="mr-3"
                onClick={() => {
                  setIsEditing(false);
                  setYoutubeUrl(
                    videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""
                  );
                  setYoutubeVideoId(videoId || "");
                }}
              >
                الغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {videoId ? (
              <div className="relative w-full mt-4">
                <SecureVideoPlayer videoId={videoId} />
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
