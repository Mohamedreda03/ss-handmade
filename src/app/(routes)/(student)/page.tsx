import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCourses from "@/components/FeaturedCourses";
import { prisma } from "@/lib/prisma";
import AboutUsSection from "@/components/sections/AboutUsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CoursesGridSection from "@/components/sections/CoursesGridSection";
import HandmadeProductsSection from "@/components/sections/HandmadeProductsSection";

export default async function Home() {
  // Fetch products data with creator information
  // const products = await prisma.product.findMany({
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: 6,
  //   include: {
  //     User: {
  //       select: {
  //         id: true,
  //         name: true,
  //         role: true,
  //       },
  //     },
  //   },
  // });

  // // Fetch courses data
  // const courses = await prisma.course.findMany({
  //   where: {
  //     isPublished: true,
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: 3,
  // });
  return (
    <div>
      <Hero />
      <AboutUsSection />
      <TestimonialsSection />
      <CoursesGridSection />
      <HandmadeProductsSection />
    </div>
  );
}
