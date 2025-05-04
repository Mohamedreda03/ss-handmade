"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSuccessStories, SuccessStory } from "@/actions/success-stories";
import { Card } from "@/components/ui/card";

interface TestimonialCardProps {
  story: SuccessStory;
  index: number;
}

const TestimonialCard = ({ story, index }: TestimonialCardProps) => {
  // Apply alternating background colors as shown in the image
  const cardBgClass =
    index === 1 ? "bg-white" : index === 0 ? "bg-[#f4f9e5]" : "bg-white";

  return (
    <Card
      className={`h-full overflow-hidden shadow-lg hover:shadow-md transition-shadow duration-300 ${cardBgClass} p-6 text-center`}
    >
      <div className="flex flex-col items-center">
        {/* Profile image */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 mb-3 mx-auto">
          <Image
            src={story.imageUrl || "/images/success/default-user.jpg"}
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
        <Image src="/images/line.svg" height={20} width={150} alt="img" />

        {/* Testimonial */}
        <p className="text-gray-700 mt-3 text-right leading-relaxed text-sm min-h-[120px]">
          {story.story.length > 200
            ? `${story.story.substring(0, 200)}...`
            : story.story}
        </p>

        {/* Read more button */}
        <Link
          href={`/success-stories/${story.id}`}
          className="mt-4 block w-full"
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
  );
};

export default function TestimonialsSection() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        setIsLoading(true);
        const result = await getSuccessStories(3);

        if (result && Array.isArray(result)) {
          setStories(result);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Error fetching success stories:", error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  // إذا لم تكن هناك قصص، لا نعرض القسم
  if (!isLoading && stories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* صورة الخلفية المتكررة والباهتة */}
      <div
        className="absolute inset-0 bg-repeat-x opacity-5"
        style={{
          backgroundImage: "url('/images/bg.jpg')",
          backgroundSize: "500px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 max-w-xl mx-auto leading-[50px]">
            ازاى الكورسات بتاعتنا غيرت حياة ناس كتير ؟ شوفوا معانا إزاي
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {stories.map((story, index) => (
              <TestimonialCard key={story.id} story={story} index={index} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link href="/success-stories">
            <Button variant="outline" size="lg" className="mt-6">
              عرض المزيد من قصص النجاح
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
