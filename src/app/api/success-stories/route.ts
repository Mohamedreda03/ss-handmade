import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// جلب قصص النجاح المعتمدة (لعرضها على الصفحة الرئيسية والصفحة المخصصة)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    // تحديد رقم الصفحة الحالية (الافتراضي: 1)
    const page = pageParam ? parseInt(pageParam) : 1;

    // تحديد عدد العناصر في الصفحة (الافتراضي: 6)
    const limit = limitParam ? parseInt(limitParam) : 6;

    // حساب عدد العناصر التي يجب تخطيها
    const skip = (page - 1) * limit;

    let query: any = {
      where: {
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    if (featured === "true") {
      query.where.isFeature = true;
    }

    // إضافة skip و take للتصفح الصفحي
    query.skip = skip;
    query.take = limit;

    // جلب القصص
    const stories = await db.successStory.findMany(query);

    // جلب إجمالي عدد القصص للتصفح الصفحي
    const totalStories = await db.successStory.count({
      where: query.where,
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
    console.error("[SUCCESS_STORIES_GET]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب قصص النجاح" },
      { status: 500 }
    );
  }
}

// إضافة قصة نجاح جديدة (للمستخدمين المسجلين فقط)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لإضافة قصة نجاح" },
        { status: 401 }
      );
    }

    // التأكد من وجود معرف المستخدم
    if (!session.user.id) {
      console.error(
        "[SUCCESS_STORIES_POST] User id is missing in session",
        session
      );
      return NextResponse.json(
        { error: "معرف المستخدم غير موجود في الجلسة" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, profession, story, achievement, course, imageUrl } = body;

    if (!name || !profession || !story || !achievement) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    console.log(
      `[SUCCESS_STORIES_POST] Creating story for user ${session.user.id}`,
      {
        name,
        profession,
        achievement,
        course,
        hasImage: !!imageUrl,
      }
    );

    // التحقق من وجود المستخدم قبل إنشاء القصة
    const userExists = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error(
        `[SUCCESS_STORIES_POST] User ${session.user.id} not found in database`
      );
      return NextResponse.json(
        { error: "المستخدم غير موجود في قاعدة البيانات" },
        { status: 404 }
      );
    }

    const newStory = await db.successStory.create({
      data: {
        userId: session.user.id,
        name,
        profession,
        story,
        achievement,
        course,
        imageUrl,
        status: "PENDING", // تغيير الحالة من APPROVED إلى PENDING للمراجعة
      },
    });

    console.log(
      `[SUCCESS_STORIES_POST] Story created successfully with id: ${newStory.id}`
    );
    return NextResponse.json(newStory);
  } catch (error) {
    console.error("[SUCCESS_STORIES_POST]", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء إضافة قصة النجاح",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
