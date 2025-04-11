"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateSellerPaymentStatus } from "@/actions/admin/updateSellerPaymentStatus";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

interface SellerPaymentActionButtonProps {
  earningId: string;
  isPaid: boolean;
}

export const SellerPaymentActionButton = ({
  earningId,
  isPaid,
}: SellerPaymentActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(isPaid);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const result = await updateSellerPaymentStatus(earningId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setIsPaymentCompleted(true);
      toast.success("تم تحديث حالة الدفع بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة الدفع");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPaymentCompleted) {
    return (
      <Button variant="ghost" size="sm" className="text-green-600" disabled>
        <CheckCircle className="w-4 h-4 mr-1" />
        تم الدفع
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      size="sm"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          جاري التحديث...
        </>
      ) : (
        "تأكيد الدفع"
      )}
    </Button>
  );
};
