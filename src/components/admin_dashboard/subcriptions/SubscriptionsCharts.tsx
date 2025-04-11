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

  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data } = await axios.get("/api/dashboard/subscription_stats");
      return data;
    },
    staleTime: 60 * 1000 * 5, // 5 دقائق حتى إعادة الجلب
  });

  const processedData = useMemo(() => {
    if (!subscriptionsData) return [];

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

    // دمج البيانات الفعلية مع الهيكل
    subscriptionsData.forEach((item: any) => {
      const index = last12Months.findIndex(
        (m) => m.timestamp === item.timestamp
      );
      if (index !== -1) {
        last12Months[index].count = item.count;
      }
    });

    return last12Months;
  }, [subscriptionsData]);

  const recentData = useMemo(() => {
    return processedData.slice(-5); // آخر 5 أشهر
  }, [processedData]);

  if (isLoading) {
    return <Loading className="h-[300px]" />;
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
