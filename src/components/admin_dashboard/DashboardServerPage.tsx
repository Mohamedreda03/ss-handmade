import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Star,
  Award,
  ShoppingCart,
  Calendar,
} from "lucide-react";

async function getDashboardData() {
  try {
    // حساب تاريخ آخر 7 أيام
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [
      studentsCount,
      coursesCount,
      productsCount,
      subscriptionsCount,
      ordersCount,
      recentSubscriptions,
      topCourses,
    ] = await Promise.all([
      // عدد الطلاب
      prisma.user.count({
        where: { role: "STUDENT" },
      }),
      // عدد الكورسات
      prisma.course.count({
        where: { isPublished: true },
      }),
      // عدد المنتجات
      prisma.product.count({
        where: { isAvailable: true },
      }),
      // عدد الاشتراكات
      prisma.subscription.count(),
      // عدد الطلبات
      prisma.order.count(),
      // الاشتراكات في آخر 7 أيام
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: last7Days,
          },
        },
      }),
      // أفضل الكورسات (بناءً على عدد الاشتراكات)
      prisma.course.findMany({
        where: { isPublished: true },
        include: {
          _count: {
            select: { Subscription: true },
          },
        },
        orderBy: {
          Subscription: {
            _count: "desc",
          },
        },
        take: 3,
      }),
    ]);

    return {
      studentsCount,
      coursesCount,
      productsCount,
      subscriptionsCount,
      ordersCount,
      recentSubscriptions,
      topCourses,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ خطأ في تحميل البيانات
          </h2>
          <p className="text-muted-foreground">
            يرجى التحقق من اتصال قاعدة البيانات والمحاولة مرة أخرى
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background to-primary/5 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
          لوحة التحكم الإدارية
        </h1>
        <p className="text-muted-foreground text-lg">
          مرحباً بك في لوحة التحكم
        </p>
      </div>{" "}
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              إجمالي الطلاب
            </CardTitle>
            <Users className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.studentsCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">مستخدم مسجل</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              الكورسات المنشورة
            </CardTitle>
            <BookOpen className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.coursesCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">كورس متاح</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              المنتجات المتاحة
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.productsCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">منتج</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              إجمالي الاشتراكات
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.subscriptionsCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">اشتراك نشط</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              عدد الطلبات
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.ordersCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">طلب إجمالي</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              الاشتراكات في آخر 7 أيام
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data.recentSubscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">اشتراك جديد</p>
          </CardContent>
        </Card>
      </div>
      {/* أفضل الكورسات */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Award className="h-5 w-5" />
            أفضل الكورسات (الأكثر اشتراكاً)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCourses.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {course.title}
                    </h3>{" "}
                    <p className="text-sm text-muted-foreground">
                      {course._count.Subscription} اشتراك • {course.price} EGP
                    </p>
                  </div>
                </div>
                <Star className="h-5 w-5 text-primary/70" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
