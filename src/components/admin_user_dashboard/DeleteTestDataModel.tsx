import React from "react";
import { Alert } from "../models/Alert";
import { Trash } from "lucide-react";

export default function DeleteTestDataModel({
  onDelete,
  isLoading,
}: {
  onDelete: () => void;
  isLoading: boolean;
}) {
  return (
    <Alert
      dialogTitle="مسح هذه المحاوله"
      dialogDescription="هل تريد مسح هذه المحاوله الآن ؟"
      dialogCancel="إلغاء"
      dialogAction="نعم قم بمسح المحاوله"
      buttonTitle={(<Trash size={16} />) as any}
      action={onDelete}
      isLoading={isLoading}
      buttonStyle="bg-transparent border dark:border-gray-700 text-black dark:text-white hover:bg-red-500 hover:text-white"
    />
  );
}
