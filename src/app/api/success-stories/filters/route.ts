import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// جلب الفلاتر المتاحة (المهن والدورات)
export async function GET(req: NextRequest) {
  try {
    // جلب جميع المهن الفريدة
    const professions = await db.successStory.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        profession: true,
      },
      distinct: ["profession"],
      orderBy: {
        profession: "asc",
      },
    });

    // جلب جميع الدورات الفريدة (غير الفارغة)
    const courses = await db.successStory.findMany({
      where: {
        status: "APPROVED",
        course: {
          not: null,
        },
      },
      select: {
        course: true,
      },
      distinct: ["course"],
      orderBy: {
        course: "asc",
      },
    });

    return NextResponse.json({
      professions: professions.map((p) => p.profession),
      courses: courses.map((c) => c.course).filter((c) => c), // تصفية القيم الفارغة
    });
  } catch (error) {
    console.error("[SUCCESS_STORIES_FILTERS_GET]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب فلاتر قصص النجاح" },
      { status: 500 }
    );
  }
}
