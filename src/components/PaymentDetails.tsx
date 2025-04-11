"use client";

import axios from "axios";
import { Button } from "./ui/button";
import { TableCell } from "./ui/table";

export default function PaymentDetails({
  invoice_id,
  invoice_ref,
}: {
  invoice_id: string;
  invoice_ref: string;
}) {
  const getInvoice = async () => {
    await axios.get(
      `https://dash.shake-out.com/api/public/vendor/invoice-status/${invoice_id}/${invoice_ref}`,
      {
        headers: {
          Authorization:
            "apikey 66e864749b647tdksB68kCjPJGp66D5dZE7tZEANPy8wp2IbSno4W",
        },
      }
    );
  };
  return (
    <TableCell className="text-center">
      <Button
        onClick={getInvoice}
        className="bg-blue-500 border border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-500"
      >
        تفاصيل الفاتورة
      </Button>
    </TableCell>
  );
}
