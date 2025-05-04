import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "معرف قصة النجاح مطلوب" },
        { status: 400 }
      );
    }

    const story = await db.successStory.findUnique({
      where: {
        id,
        status: "APPROVED", // Only return approved stories
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "لم يتم العثور على قصة النجاح" },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("[SUCCESS_STORY_GET]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب تفاصيل قصة النجاح" },
      { status: 500 }
    );
  }
}
