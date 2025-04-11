"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/admin/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`المنتجات (${products.length})`}
          description="قائمة بجميع المنتجات المتاحة"
        />
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          اضافة منتج جديد
        </Button>
      </div>
      <Separator className="my-4" />

      {loading ? (
        <Loading className="h-[300px] flex items-center justify-center" />
      ) : (
        <div className="mt-6">
          <DataTable columns={columns} data={products} />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
