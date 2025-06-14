"use client";

import { useQuery } from "react-query";
import axios from "axios";
import { OrdersClientRTL } from "./OrdersClientRTL";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    status: string;
    product: {
      id: string;
      name: string;
      imageUrl?: string;
      userId: string;
      User: {
        id: string;
        name: string;
        email: string;
      };
    };
  }>;
}

interface OrdersData {
  buyerOrders: Order[];
  sellerOrders: Order[];
  totalRevenue: number;
}

export default function MyOrdersClient() {
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<OrdersData>(
    ["orders"],
    async () => {
      const response = await axios.get("/api/orders");
      return response.data;
    },
    {
      staleTime: 0, // البيانات تعتبر قديمة فوراً
      cacheTime: 0, // لا تخزين مؤقت
      refetchOnWindowFocus: true, // إعادة جلب عند التركيز على النافذة
    }
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold">جاري تحميل الطلبات...</h1>
        </div>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 min-h-[600px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">خطأ في تحميل الطلبات</h1>
          <p className="text-muted-foreground">
            حدث خطأ أثناء تحميل طلباتك. يرجى المحاولة مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md"
          >
            إعادة تحميل
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrdersClientRTL
      buyerOrders={orders.buyerOrders}
      sellerOrders={orders.sellerOrders}
      totalRevenue={orders.totalRevenue}
    />
  );
}
