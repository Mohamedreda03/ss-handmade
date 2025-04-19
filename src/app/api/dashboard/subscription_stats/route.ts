import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const monthsInArabic = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// backend (api route)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc", // ترتيب حسب التاريخ
      },
    });

    // تجميع البيانات مع مراعاة السنة
    const groupedData = subscriptions.reduce((acc, { createdAt }) => {
      const date = new Date(createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = {
          year,
          month,
          count: 0,
        };
      }

      acc[key].count++;
      return acc;
    }, {} as Record<string, { year: number; month: number; count: number }>);

    const result = Object.values(groupedData)
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map(({ year, month, count }) => ({
        month: monthsInArabic[month],
        year,
        count,
        timestamp: new Date(year, month).getTime(),
      }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Get Dashboard Data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
