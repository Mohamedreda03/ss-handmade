import React from "react";
import { Alert } from "@/components/models/Alert";
import { Trash } from "lucide-react";

export default function DeleteCouponModel({
  onDelete,
  isLoading,
}: {
  onDelete: () => void;
  isLoading?: boolean;
}) {
  return (
    <Alert
      dialogTitle="مسح الكوبون"
      dialogDescription="هل تريد مسح هذا الكوبون الآن ؟"
      dialogCancel="إلغاء"
      dialogAction="نعم قم بمسح الكوبون"
      buttonTitle={(<Trash size={16} />) as any}
      action={onDelete}
      isLoading={isLoading}
      buttonStyle="bg-transparent border dark:border-gray-700 text-black dark:text-white hover:bg-red-500 hover:text-white"
    />
  );
}
