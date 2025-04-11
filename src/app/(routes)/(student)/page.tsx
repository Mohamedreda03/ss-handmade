import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCourses from "@/components/FeaturedCourses";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Fetch products data
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  // Fetch courses data
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return (
    <div>
      <Hero />
      <FeaturedProducts products={products || []} />
      <FeaturedCourses courses={courses || []} />
    </div>
  );
}
