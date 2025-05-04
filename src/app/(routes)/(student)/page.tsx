import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCourses from "@/components/FeaturedCourses";
import FeaturedSuccessStories from "@/components/FeaturedSuccessStories";
import { prisma } from "@/lib/prisma";
import AboutUsSection from "@/components/sections/AboutUsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CoursesGridSection from "@/components/sections/CoursesGridSection";
import HandmadeProductsSection from "@/components/sections/HandmadeProductsSection";

export default async function Home() {
  return (
    <div>
      <Hero />
      <AboutUsSection />
      <TestimonialsSection />
      {/* <FeaturedSuccessStories /> */}
      <CoursesGridSection />
      <HandmadeProductsSection />
    </div>
  );
}
