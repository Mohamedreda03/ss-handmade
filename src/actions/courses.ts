"use server";

import { prisma } from "@/lib/prisma";

export async function getFeaturedCourses(limit: number = 6) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        isPublished: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return courses;
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return [];
  }
}
