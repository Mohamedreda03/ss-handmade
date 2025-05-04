import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// جلب جميع قصص النجاح للمشرفين (بما في ذلك المعلقة والمرفوضة) مع دعم التصفح الصفحي
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    // تحديد رقم الصفحة الحالية (الافتراضي: 1)
    const page = pageParam ? parseInt(pageParam) : 1;

    // تحديد عدد العناصر في الصفحة (الافتراضي: 10)
    const limit = limitParam ? parseInt(limitParam) : 10;

    // حساب عدد العناصر التي يجب تخطيها
    const skip = (page - 1) * limit;

    let query: any = {
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // إضافة تصفية حسب الحالة إذا تم تحديدها
    if (status) {
      query.where = {
        status,
      };
    }

    // إضافة skip و take للتصفح الصفحي
    query.skip = skip;
    query.take = limit;

    // جلب القصص
    const stories = await db.successStory.findMany(query);

    // جلب إجمالي عدد القصص للتصفح الصفحي
    const countQuery = status ? { status } : {};
    const totalStories = await db.successStory.count({
      where: countQuery,
    });

    const totalPages = Math.ceil(totalStories / limit);

    return NextResponse.json({
      stories,
      pagination: {
        total: totalStories,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("[ADMIN_SUCCESS_STORIES_GET]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب قصص النجاح" },
      { status: 500 }
    );
  }
}

// تحديث حالة قصة نجاح (موافقة أو رفض)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, status, isFeature } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرف قصة النجاح مطلوب" },
        { status: 400 }
      );
    }

    const updatedStory = await db.successStory.update({
      where: { id },
      data: {
        status,
        isFeature: isFeature !== undefined ? isFeature : undefined,
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("[ADMIN_SUCCESS_STORIES_PATCH]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث قصة النجاح" },
      { status: 500 }
    );
  }
}

// حذف قصة نجاح
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "معرف قصة النجاح مطلوب" },
        { status: 400 }
      );
    }

    await db.successStory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SUCCESS_STORIES_DELETE]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف قصة النجاح" },
      { status: 500 }
    );
  }
}
