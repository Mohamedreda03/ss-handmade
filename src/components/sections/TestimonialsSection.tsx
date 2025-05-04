"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  content: string;
}

const TestimonialCard = ({
  name,
  role,
  image,
  content,
}: TestimonialCardProps) => {
  return (
    <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full relative z-10">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden relative">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover border-2 border-primary rounded-full"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-xl">{name}</h3>
          </div>
          <Image
            src="/images/line.svg"
            alt="line"
            width={200}
            height={10}
            className=""
          />
        </div>
        <p className="text-gray-700 flex-grow text-lg text-center">{content}</p>
        <Button className="text-lg h-12">أقرأ القصة كاملة</Button>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  const testimonials: TestimonialCardProps[] = [
    {
      name: "أبو عزيز",
      role: "متعلم",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // يمكنك تغيير هذه إلى صور حقيقية
      content:
        "كنت بدأ التطريز نفس منتهيش عايزة أبدا أبدا أول حاجة. بعد الكورس بقات أبوي أول حاجة وطبقتها على وتانيا في البيت. احسنت إلى أخيرا يعمل.",
    },
    {
      name: "أحمد يوسف",
      role: "متعلم",
      image:
        "https://images.pexels.com/photos/3777946/pexels-photo-3777946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      content:
        "الكورس علمني كل انواع واشكالات وتكنيكات مختلفة، اتعلمت تطريز عربي. كمان حياتي كلها اتغيرت مش من اول وشتغلت من اول ورشة.",
    },
    {
      name: "محمد سامي",
      role: "متعلم",
      image:
        "https://images.pexels.com/photos/3789888/pexels-photo-3789888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      content:
        "بدأت من الصفر لتعلم الكورس تماما اعتبر أول أكسسوارا بنفسي. دوافعي يخليني أشيل من نوع 'مستحيل' إتحول إلى كلمة 'ممكن'...",
    },
  ];

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
          <h2 className="text-4xl font-bold mb-4 text-gray-900 max-w-xl mx-auto">
            ازاء الكورسات بتاعتنا غيرت حياة ناس كتير ؟ شوفوا معانا إزاي
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              image={testimonial.image}
              content={testimonial.content}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
