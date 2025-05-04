"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string;
  imageUrl?: string;
  user: {
    name?: string;
    image?: string;
  };
}

export default function FeaturedSuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "/api/success-stories?featured=true&limit=3"
        );
        if (response.data && response.data.stories) {
          setStories(response.data.stories);
        } else if (Array.isArray(response.data)) {
          setStories(response.data);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Error fetching featured success stories:", error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedStories();
  }, []);

  if (!isLoading && stories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 px-4 overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 max-w-xl mx-auto leading-[50px]">
            قصص نجاح طلابنا المميزين
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تعرف على كيف غيرت دوراتنا حياة طلابنا وساعدتهم في تحقيق أحلامهم
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {stories.map((story, index) => {
                // Apply alternating background colors as shown in the image
                const cardBgClass =
                  index === 1
                    ? "bg-white"
                    : index === 2
                    ? "bg-[#f4f9e5]"
                    : "bg-white";

                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full"
                  >
                    <Card
                      className={`h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${cardBgClass} p-6 text-center`}
                    >
                      <div className="flex flex-col items-center">
                        {/* Profile image */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 mb-3 mx-auto">
                          <Image
                            src={
                              story.imageUrl ||
                              story.user.image ||
                              "/images/success/default-user.jpg"
                            }
                            alt={story.name}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        {/* Name with dashed borders */}
                        <h3 className="text-lg font-bold text-gray-800 relative py-2 px-4 inline-block">
                          {story.name || "أم فريد"}
                        </h3>

                        {/* Dashed line */}
                        <div className="border-t border-dashed border-gray-400 w-32 my-2"></div>

                        {/* Testimonial */}
                        <p className="text-gray-700 mt-3 text-right leading-relaxed text-sm min-h-[120px]">
                          {story.story.length > 200
                            ? `${story.story.substring(0, 200)}...`
                            : story.story}
                        </p>

                        {/* Read more button */}
                        <Link
                          href={`/success-stories/${story.id}`}
                          className="mt-4 block"
                        >
                          <Button
                            variant="secondary"
                            className="bg-[#67744c] hover:bg-[#565f3f] text-white w-full"
                          >
                            اقرأ القصة كاملة
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <Link href="/success-stories">
                <Button variant="outline" size="lg" className="mt-6">
                  عرض المزيد من قصص النجاح
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
