"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    name?: string;
    image?: string;
  };
}

export default function SuccessStoryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/success-stories/${params.id}`);
        setStory(response.data);
      } catch (error) {
        console.error("Error fetching story details:", error);
        setError("لا يمكن العثور على قصة النجاح المطلوبة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center bg-red-50 py-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <Button onClick={() => router.push("/success-stories")}>
            العودة إلى قصص النجاح
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/success-stories">
          <Button variant="ghost" className="mb-6">
            ← العودة إلى قصص النجاح
          </Button>
        </Link>

        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="relative h-80 w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <Image
                src={
                  story.imageUrl?.startsWith("/uploads")
                    ? story.imageUrl
                    : story.imageUrl || `/images/success/default-user.jpg`
                }
                alt={story.name}
                layout="fill"
                objectFit="cover"
                className="z-0"
              />
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{story.name}</h1>
                  <p className="text-primary font-medium">{story.profession}</p>
                </div>
                <div>
                  <Badge className="bg-primary text-white px-4 py-2 text-lg">
                    {story.achievement}
                  </Badge>
                </div>
              </div>

              {story.course && (
                <div className="mb-6">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {story.course}
                  </Badge>
                </div>
              )}

              <div className="prose prose-lg max-w-none mb-8">
                <p className="whitespace-pre-wrap">{story.story}</p>
              </div>

              <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-gray-500">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={
                        story.user?.image?.startsWith("/uploads")
                          ? story.user?.image
                          : story.user?.image ||
                            `/images/success/default-user.jpg`
                      }
                      alt={story.user?.name || "المستخدم"}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <span>{story.user?.name || "مستخدم"}</span>
                </div>
                <div>
                  <span>تاريخ النشر: </span>
                  <span>
                    {new Date(story.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
