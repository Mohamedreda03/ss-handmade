"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function ApiDiagnostics() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test database connection
      console.log("🔍 Testing database...");
      const dbTest = await axios.get("/api/test-db");
      results.database = { success: true, data: dbTest.data };
      console.log("✅ Database test passed");
    } catch (error) {
      console.error("❌ Database test failed:", error);
      results.database = { success: false, error: error };
    }

    try {
      // Test dashboard data API
      console.log("🔍 Testing dashboard data...");
      const dashboardTest = await axios.get("/api/dashboard/dashboard_data");
      results.dashboardData = { success: true, data: dashboardTest.data };
      console.log("✅ Dashboard data test passed");
    } catch (error) {
      console.error("❌ Dashboard data test failed:", error);
      results.dashboardData = { success: false, error: error };
    }

    try {
      // Test subscription stats API
      console.log("🔍 Testing subscription stats...");
      const statsTest = await axios.get("/api/dashboard/subscription_stats");
      results.subscriptionStats = { success: true, data: statsTest.data };
      console.log("✅ Subscription stats test passed");
    } catch (error) {
      console.error("❌ Subscription stats test failed:", error);
      results.subscriptionStats = { success: false, error: error };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔧 تشخيص API
          <Button onClick={runTests} disabled={loading}>
            {loading ? "جاري الاختبار..." : "تشغيل الاختبارات"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  testResults.database?.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <h4 className="font-semibold">📊 قاعدة البيانات</h4>
                <p
                  className={
                    testResults.database?.success
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {testResults.database?.success ? "✅ متصلة" : "❌ غير متصلة"}
                </p>
                {testResults.database?.data && (
                  <p className="text-sm mt-2">
                    المستخدمين: {testResults.database.data.userCount} |
                    الاشتراكات: {testResults.database.data.subscriptionCount}
                  </p>
                )}
              </div>

              <div
                className={`p-4 rounded-lg ${
                  testResults.dashboardData?.success
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <h4 className="font-semibold">📈 بيانات Dashboard</h4>
                <p
                  className={
                    testResults.dashboardData?.success
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {testResults.dashboardData?.success
                    ? "✅ تعمل"
                    : "❌ لا تعمل"}
                </p>
                {testResults.dashboardData?.data && (
                  <p className="text-sm mt-2">
                    الطلاب: {testResults.dashboardData.data.usersCount} |
                    الكورسات: {testResults.dashboardData.data.coursesCount}
                  </p>
                )}
              </div>

              <div
                className={`p-4 rounded-lg ${
                  testResults.subscriptionStats?.success
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <h4 className="font-semibold">📊 إحصائيات الاشتراكات</h4>
                <p
                  className={
                    testResults.subscriptionStats?.success
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {testResults.subscriptionStats?.success
                    ? "✅ تعمل"
                    : "❌ لا تعمل"}
                </p>
                {testResults.subscriptionStats?.data && (
                  <p className="text-sm mt-2">
                    عدد النقاط: {testResults.subscriptionStats.data.length}
                  </p>
                )}
              </div>
            </div>

            {/* Error details */}
            {(!testResults.database?.success ||
              !testResults.dashboardData?.success ||
              !testResults.subscriptionStats?.success) && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">
                  تفاصيل الأخطاء:
                </h4>
                <div className="space-y-2 text-sm">
                  {!testResults.database?.success && (
                    <p className="text-red-600">
                      ❌ قاعدة البيانات:{" "}
                      {testResults.database?.error?.message || "خطأ غير معروف"}
                    </p>
                  )}
                  {!testResults.dashboardData?.success && (
                    <p className="text-red-600">
                      ❌ بيانات Dashboard:{" "}
                      {testResults.dashboardData?.error?.message ||
                        "خطأ غير معروف"}
                    </p>
                  )}
                  {!testResults.subscriptionStats?.success && (
                    <p className="text-red-600">
                      ❌ إحصائيات الاشتراكات:{" "}
                      {testResults.subscriptionStats?.error?.message ||
                        "خطأ غير معروف"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
