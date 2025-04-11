"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export function Alert({
  buttonTitle,
  dialogTitle,
  dialogDescription,
  dialogCancel,
  dialogAction,
  buttonStyle,
  isLoading,
  action,
}: {
  buttonTitle: string;
  dialogTitle: string | JSX.Element;
  dialogDescription: string;
  dialogCancel: string;
  dialogAction: string;
  buttonStyle?: string;
  isLoading?: boolean;
  action: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={buttonStyle} disabled={isLoading}>
          <span>{buttonTitle}</span>
          {isLoading && (
            <LoaderCircle size={16} className="animate-spin mr-2" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            {dialogTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            {dialogDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center gap-3">
          <AlertDialogCancel className="w-full sm:w-fit">
            {dialogCancel}
          </AlertDialogCancel>
          <AlertDialogAction className="w-full sm:w-fit" onClick={action}>
            {dialogAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
