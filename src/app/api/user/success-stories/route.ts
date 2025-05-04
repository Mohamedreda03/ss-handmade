import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// جلب قصص النجاح الخاصة بالمستخدم (بغض النظر عن حالة الاعتماد)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لعرض قصص النجاح الخاصة بك" },
        { status: 401 }
      );
    }

    // تأكد من وجود معرف المستخدم
    if (!session.user.id) {
      console.error(
        "[USER_SUCCESS_STORIES_GET] User ID is missing in session",
        session
      );
      return NextResponse.json(
        { error: "معرف المستخدم غير موجود في الجلسة" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // إعداد الاستعلام مع تصفية حسب المستخدم
    let query: any = {
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // إضافة تصفية حسب الحالة إذا تم تحديدها
    if (status) {
      query.where.status = status.toUpperCase();
    }

    console.log(
      `[USER_SUCCESS_STORIES_GET] Fetching stories for user ${session.user.id}`,
      query
    );

    // جلب القصص
    const stories = await db.successStory.findMany(query);

    console.log(
      `[USER_SUCCESS_STORIES_GET] Found ${stories.length} stories for user ${session.user.id}`
    );

    return NextResponse.json(stories);
  } catch (error) {
    console.error("[USER_SUCCESS_STORIES_GET]", error);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء جلب قصص النجاح الخاصة بك",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// تعديل قصة نجاح موجودة (طريقة PUT)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لتعديل قصة النجاح" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, name, profession, story, achievement, course, imageUrl } = body;

    if (!id || !name || !profession || !story || !achievement) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من وجود القصة والتأكد من أنها تخص المستخدم الحالي
    const existingStory = await db.successStory.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "قصة النجاح غير موجودة" },
        { status: 404 }
      );
    }

    // التأكد من أن القصة تنتمي للمستخدم الحالي (إلا إذا كان المستخدم مشرفًا)
    if (
      existingStory.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "لا يمكنك تعديل قصة نجاح لا تنتمي إليك" },
        { status: 403 }
      );
    }

    // إذا كانت القصة تم تعديلها، نعيدها إلى حالة المراجعة
    let newStatus = existingStory.status;
    if (existingStory.status === "APPROVED" && session.user.role !== "ADMIN") {
      newStatus = "PENDING";
      console.log(
        `[USER_SUCCESS_STORIES_PUT] Story status changed from APPROVED to PENDING for story ${id}`
      );
    }

    const updatedStory = await db.successStory.update({
      where: { id },
      data: {
        name,
        profession,
        story,
        achievement,
        course,
        imageUrl,
        status: newStatus,
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("[USER_SUCCESS_STORIES_PUT]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تعديل قصة النجاح" },
      { status: 500 }
    );
  }
}

// حذف قصة نجاح
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لحذف قصة النجاح" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "يرجى تحديد معرف قصة النجاح المراد حذفها" },
        { status: 400 }
      );
    }

    // التحقق من وجود القصة والتأكد من أنها تخص المستخدم الحالي
    const existingStory = await db.successStory.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "قصة النجاح غير موجودة" },
        { status: 404 }
      );
    }

    // التأكد من أن القصة تنتمي للمستخدم الحالي (إلا إذا كان المستخدم مشرفًا)
    if (
      existingStory.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "لا يمكنك حذف قصة نجاح لا تنتمي إليك" },
        { status: 403 }
      );
    }

    await db.successStory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_SUCCESS_STORIES_DELETE]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف قصة النجاح" },
      { status: 500 }
    );
  }
}
