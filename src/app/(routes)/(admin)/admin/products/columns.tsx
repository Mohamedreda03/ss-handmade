"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl;
      return imageUrl ? (
        <div className="relative h-10 w-10">
          <Image
            src={imageUrl}
            alt={row.original.name}
            fill
            className="rounded-md object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-10 bg-slate-100 rounded-md" />
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return <div>{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.stock}</div>;
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.original.isAvailable;
      return (
        <Badge variant={isAvailable ? "success" : "destructive"}>
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      const router = useRouter();
      const product = row.original;

      const handleDelete = async () => {
        try {
          await axios.delete(`/api/admin/products/${product.id}`);
          toast.success("Product deleted");
          router.refresh();
        } catch (error) {
          toast.error("Something went wrong");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/products/${product.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
