"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import TransactionsData from "./TransactionsData";
import UserCoursesData from "./UserCoursesData";
import UserDataTableAndUpdate from "./UserDataTableAndUpdate";

interface AllUserDataProps {
  userId: string;
}

export default function AllUserData({ userId }: AllUserDataProps) {
  const [switchData, setSwitchData] = useState<
    "courses" | "transactions" | "user_data"
  >("user_data");

  return (
    <div className="my-10">
      <div className="flex flex-wrap items-center justify-center gap-3 border p-2 rounded-lg border-secondary/50">
        <Button
          variant={switchData === "user_data" ? "default" : "outline"}
          onClick={() => setSwitchData("user_data")}
        >
          بيانات المستخدم
        </Button>
        <Button
          variant={switchData === "transactions" ? "secondary" : "outline"}
          onClick={() => setSwitchData("transactions")}
        >
          عمليات المستخدم
        </Button>
        <Button
          variant={switchData === "courses" ? "secondary" : "outline"}
          onClick={() => setSwitchData("courses")}
        >
          بيانات كورسات المستخدم
        </Button>
      </div>
      <div className="mt-8">
        {switchData === "transactions" && <TransactionsData userId={userId} />}
        {switchData === "courses" && <UserCoursesData userId={userId} />}
        {switchData === "user_data" && (
          <UserDataTableAndUpdate userId={userId} />
        )}
      </div>
    </div>
  );
}
