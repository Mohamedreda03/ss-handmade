import Hero from "@/components/Hero";
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
