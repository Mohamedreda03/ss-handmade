"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/Loading";

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // يمكنك إما استخدام البحث في الخادم أو البحث المحلي
        // للبحث في الخادم، استخدم المعاملات أدناه:
        // const params = new URLSearchParams();
        // if (searchTerm) params.append('search', searchTerm);
        // if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
        // if (stockFilter !== 'all') params.append('stockFilter', stockFilter);
        // const response = await axios.get(`/api/admin/products?${params}`);

        const response = await axios.get("/api/admin/products");
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  // البحث والفلترة في المنتجات
  useEffect(() => {
    let filtered = products;

    // فلترة حسب النص المدخل
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          product.price.toString().includes(searchTerm) ||
          product.stock.toString().includes(searchTerm)
      );
    }

    // فلترة حسب التوفر
    if (availabilityFilter !== "all") {
      filtered = filtered.filter((product: any) =>
        availabilityFilter === "available"
          ? product.isAvailable
          : !product.isAvailable
      );
    }

    // فلترة حسب المخزون
    if (stockFilter !== "all") {
      filtered = filtered.filter((product: any) => {
        switch (stockFilter) {
          case "in_stock":
            return product.stock > 0;
          case "low_stock":
            return product.stock > 0 && product.stock <= 10;
          case "out_of_stock":
            return product.stock === 0;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, availabilityFilter, stockFilter, products]);

  const clearFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setStockFilter("all");
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`المنتجات (${filteredProducts.length})`}
          description="قائمة بجميع المنتجات المتاحة"
        />
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          اضافة منتج جديد
        </Button>
      </div>
      <Separator className="my-4" /> {/* مربع البحث والفلاتر المحسنة */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المنتجات (الاسم، الوصف، السعر، المخزون)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="التوفر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المنتجات</SelectItem>
              <SelectItem value="available">متاح</SelectItem>
              <SelectItem value="unavailable">غير متاح</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="المخزون" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المخزون</SelectItem>
              <SelectItem value="in_stock">متوفر</SelectItem>
              <SelectItem value="low_stock">مخزون قليل</SelectItem>
              <SelectItem value="out_of_stock">نفد المخزون</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm ||
            availabilityFilter !== "all" ||
            stockFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            عرض {filteredProducts.length} من أصل {products.length} منتج
          </div>
          {(searchTerm ||
            availabilityFilter !== "all" ||
            stockFilter !== "all") && (
            <div className="text-blue-600">الفلاتر مُفعّلة</div>
          )}
        </div>
      </div>
      {loading ? (
        <Loading className="h-[300px] flex items-center justify-center" />
      ) : (
        <div className="mt-6">
          <div className="rounded-md border bg-card">
            <DataTable columns={columns} data={filteredProducts} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
