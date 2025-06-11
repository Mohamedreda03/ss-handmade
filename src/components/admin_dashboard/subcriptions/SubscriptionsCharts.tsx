"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { useMediaQuery } from "react-responsive";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import Loading from "@/components/Loading";
import { useQuery } from "react-query";
import axios from "axios";
import { useMemo } from "react";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface SubscriptionsChartsProps {
  subscriptions: {
    monthe: string;
    subscriptions: number;
  }[];
}

// frontend

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

export default function SubscriptionsCharts() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const {
    data: subscriptionsData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      console.log("🔄 Fetching subscription stats...");
      try {
        const { data } = await axios.get("/api/dashboard/subscription_stats");
        console.log("✅ Subscription stats received:", data);
        return data;
      } catch (error) {
        console.error("❌ Failed to fetch subscription stats:", error);
        throw error;
      }
    },
    staleTime: 60 * 1000 * 5, // 5 دقائق حتى إعادة الجلب
    retry: 3,
    retryDelay: 1000,
  });
  const processedData = useMemo(() => {
    // إذا لم تكن هناك بيانات، أنشئ بيانات فارغة للأشهر الـ 12 الماضية
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // إنشاء خريطة للشهور الـ 12 الأخيرة
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i);
      return {
        timestamp: date.getTime(),
        month: monthsInArabic[date.getMonth()],
        year: date.getFullYear(),
        count: 0,
      };
    }).reverse();

    // إذا لم تكن هناك بيانات من الخادم، أرجع البيانات الفارغة
    if (!subscriptionsData || subscriptionsData.length === 0) {
      console.log("📊 No subscription data, showing empty chart");
      return last12Months;
    }

    // دمج البيانات الفعلية مع الهيكل
    subscriptionsData.forEach((item: any) => {
      const index = last12Months.findIndex(
        (m) => m.timestamp === item.timestamp
      );
      if (index !== -1) {
        last12Months[index].count = item.count;
      }
    });

    console.log("📊 Processed chart data:", last12Months);
    return last12Months;
  }, [subscriptionsData]);

  const recentData = useMemo(() => {
    return processedData.slice(-5); // آخر 5 أشهر
  }, [processedData]);
  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  if (isError) {
    console.error("❌ Error loading subscription data:", error);
    return (
      <Card className="my-10">
        <CardHeader>
          <CardTitle>عدد الاشتراكات في الكورسات</CardTitle>
          <CardDescription>حدث خطأ في تحميل البيانات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">⚠️ فشل في تحميل بيانات المخطط</p>
              <p className="text-sm">يرجى التحقق من اتصال قاعدة البيانات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!subscriptionsData || subscriptionsData.length === 0) {
    return (
      <Card className="my-10">
        <CardHeader>
          <CardTitle>عدد الاشتراكات في الكورسات</CardTitle>
          <CardDescription>آخر 5 أشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[500px] w-full" config={chartConfig}>
            <BarChart
              data={processedData.slice(-5)}
              margin={{ top: 20 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value, index) => {
                  const item = processedData.slice(-5)[index];
                  return `${value}\n${item.year}`;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
                <LabelList
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={14}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="text-center text-sm text-muted-foreground mt-4">
            📊 لا توجد اشتراكات حتى الآن - سيتم عرض البيانات عند توفرها
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-10">
      <CardHeader>
        <CardTitle>عدد الاشتراكات في الكورسات</CardTitle>
        <CardDescription>آخر 5 أشهر</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[500px] w-full" config={chartConfig}>
          <BarChart data={recentData} margin={{ top: 20 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value, index) => {
                const item = recentData[index];
                return `${value}\n${item.year}`;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={14}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
