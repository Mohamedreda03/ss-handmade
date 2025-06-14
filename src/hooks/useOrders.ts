"use client";

import { useQuery, useQueryClient } from "react-query";
import axios from "axios";

export interface Order {
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

export interface OrdersData {
  buyerOrders: Order[];
  sellerOrders: Order[];
  totalRevenue: number;
}

export function useOrders() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery<OrdersData>(
    ["orders"],
    async () => {
      const response = await axios.get("/api/orders");
      return response.data;
    },
    {
      staleTime: 0, // Always consider data stale
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: true, // Refetch when window gets focus
    }
  );
  const invalidateOrders = () => {
    queryClient.invalidateQueries(["orders"]);
  };

  const refreshOrders = () => {
    refetch();
  };

  return {
    orders: data,
    isLoading,
    error,
    refetch: refreshOrders,
    invalidateOrders,
  };
}

export function useOrder(orderId: string) {
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery<Order>(["order", orderId], async () => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
  });

  const invalidateOrder = () => {
    queryClient.invalidateQueries(["order", orderId]);
    queryClient.invalidateQueries(["orders"]); // Also invalidate orders list
  };

  const refreshOrder = () => {
    refetch();
  };

  return {
    order,
    isLoading,
    error,
    refetch: refreshOrder,
    invalidateOrder,
  };
}
