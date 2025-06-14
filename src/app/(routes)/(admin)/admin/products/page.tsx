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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("APPROVED"); // عرض المنتجات المقبولة فقط بشكل افتراضي
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // تفعيل التحميل عند تغيير الفلاتر
      try {
        // بناء المعايير للـ API
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        if (availabilityFilter !== "all") {
          params.append("availability", availabilityFilter);
        }

        if (stockFilter !== "all") {
          params.append("stockFilter", stockFilter);
        }

        if (productTypeFilter !== "all") {
          params.append("productType", productTypeFilter);
        }
        if (approvalStatusFilter !== "all") {
          params.append("approvalStatus", approvalStatusFilter);
        }

        const url = `/api/admin/products${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await axios.get(url);
        // التعامل مع الهيكل الجديد للـ API response
        const productsData = response.data.data || response.data;
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchTerm,
    availabilityFilter,
    stockFilter,
    productTypeFilter,
    approvalStatusFilter,
  ]); // إزالة منطق الفلترة المحلية لأن الفلترة تتم من جانب الخادم
  // useEffect(() => {
  //   // الفلترة تتم من جانب الخادم الآن
  // }, [searchTerm, availabilityFilter, stockFilter, productTypeFilter, approvalStatusFilter, products]);
  const clearFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setStockFilter("all");
    setProductTypeFilter("all");
    setApprovalStatusFilter("all");
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        {" "}
        <Heading
          title={`المنتجات (${products.length})`}
          description="قائمة بالمنتجات المقبولة والمتاحة للعملاء"
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
          </Select>{" "}
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
          <Select
            value={productTypeFilter}
            onValueChange={setProductTypeFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="نوع المنتج" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="HANDMADE">يدوي</SelectItem>
              <SelectItem value="EQUIPMENT">معدات</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={approvalStatusFilter}
            onValueChange={setApprovalStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="حالة الموافقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="PENDING">في انتظار الموافقة</SelectItem>
              <SelectItem value="APPROVED">مقبول</SelectItem>
              <SelectItem value="REJECTED">مرفوض</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm ||
            availabilityFilter !== "all" ||
            stockFilter !== "all" ||
            productTypeFilter !== "all" ||
            approvalStatusFilter !== "all") && (
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
          {" "}
          <div>عرض {products.length} منتج</div>
          {(searchTerm ||
            availabilityFilter !== "all" ||
            stockFilter !== "all" ||
            productTypeFilter !== "all" ||
            approvalStatusFilter !== "all") && (
            <div className="text-blue-600">الفلاتر مُفعّلة</div>
          )}
        </div>
      </div>
      {loading ? (
        <Loading className="h-[300px] flex items-center justify-center" />
      ) : (
        <div className="mt-6">
          <div className="rounded-md border bg-card">
            <DataTable columns={columns} data={products} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
