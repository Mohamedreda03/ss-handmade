import React from "react";
import { Alert } from "./Alert";

export default function EndTestModel({
  onEndTest,
  isLoading,
}: {
  onEndTest: () => void;
  isLoading: boolean;
}) {
  return (
    <Alert
      dialogTitle="انهاء الامتحان"
      dialogDescription="هل تريد الانتهاء من الامتحان الآن ؟"
      dialogCancel="إلغاء"
      dialogAction="نعم قم بانهاء الامتحان"
      buttonTitle="انهاء الامتحان"
      action={onEndTest}
      isLoading={isLoading}
    />
  );
}
