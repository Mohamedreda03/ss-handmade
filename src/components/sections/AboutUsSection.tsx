"use client";

import Image from "next/image";

export default function AboutUsSection() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">من نحن</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            منصة رائدة في تعليم الفنون اليدوية تقدم تجربة تعليمية فريدة مع أفضل
            المدربين المحترفين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <Image
            src="/about/about-1.svg"
            alt="About Us"
            width={500}
            height={500}
            className="hidden md:block"
          />
          <Image
            src="/about/about-2.svg"
            alt="About Us"
            width={500}
            height={500}
            className="hidden md:block"
          />
          <Image
            src="/about/about-3.svg"
            alt="About Us"
            width={500}
            height={500}
            className="hidden md:block"
          />
        </div>
      </div>
    </section>
  );
}
