import { cn } from "@/lib/utils";
import { Award, Hourglass, Target, Trophy } from "lucide-react";
import Image from "next/image";
import React from "react";

const features = [
  {
    id: 1,
    // title: "جوائز بالآلاف للأوائل",
    // image: Trophy,
    // color_border: "border-blue-500",
    // color_icon: "text-blue-500",
    image: "/img/feature1.png",
  },
  {
    id: 2,
    // title: "أضخم بنك اسئلة في الجمهورية",
    // image: Target,
    // color_border: "border-rose-500",
    // color_icon: "text-rose-500",
    image: "/img/feature2.png",
  },
  {
    id: 3,
    // title: "مراجعات دورية",
    // image: Award,
    // color_border: "border-yellow-500",
    // color_icon: "text-yellow-500",
    image: "/img/feature3.png",
  },
  {
    id: 4,
    // title: "هتوفر وقتك و تحضر من بيتك",
    // image: Hourglass,
    // color_border: "border-orange-500",
    // color_icon: "text-orange-500",
    image: "/img/feature4.png",
  },
];

export default function WhyUs() {
  return (
    <div className="max-w-screen-2xl mx-auto px-5 mt-8 mb-10 md:mb-20">
      <div className="flex items-center justify-center">
        <h2
          className={cn(
            "text-5xl border-b border-blue-500 text-first text-center leading-[70px]"
          )}
        >
          هتلاقي ايه معانا يا باشا
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 mt-14">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="hover:-translate-y-4 transition duration-200"
          >
            <Image
              src={feature.image}
              width={900}
              height={100}
              className="rounded-3xl"
              alt="feature"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
