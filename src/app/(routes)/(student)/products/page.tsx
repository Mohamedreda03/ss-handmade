"use client";

import ProductCard from "@/components/products/product-card";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Loading from "@/components/Loading";
import { Product } from "@prisma/client";
import { useQuery } from "react-query";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "newest",
    productType: "all",
  });

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input to avoid too many requests
  const [searchInput, setSearchInput] = useState("");

  // React Query hook for fetching products
  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(
    ["products", filters, currentPage],
    async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      params.append("sort", filters.sortBy);
      if (filters.productType !== "all")
        params.append("productType", filters.productType);
      params.append("page", currentPage.toString());

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Set total pages from response
      setTotalPages(data.totalPages || 1);

      return data.data || [];
    },
    {
      keepPreviousData: true, // Keep old data while fetching new data
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry once on failure
      onError: (error) => {
        console.error("Error fetching products:", error);
      },
    }
  );

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleProductTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, productType: value }));
    setCurrentPage(1); // Reset to first page on product type change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top when changing page
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      sortBy: "newest",
      productType: "all",
    });
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max to show, display all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of pagination range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        start = 2;
        end = Math.min(totalPages - 1, maxPagesToShow - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - (maxPagesToShow - 2));
        end = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Filter Section */}
      <div className="bg-card rounded-lg shadow p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">تصفية المنتجات</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="ابحث عن منتج..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10 rtl:pr-10 rtl:pl-4"
              disabled={isLoading}
            />
            <div className="absolute left-3 rtl:right-3 rtl:left-auto top-2.5">
              {isFetching && filters.search ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          <Select
            value={filters.productType}
            onValueChange={handleProductTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="نوع المنتج" />
              {isFetching && filters.productType !== "all" && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المنتجات</SelectItem>
              <SelectItem value="HANDMADE">مصنعات يدويه</SelectItem>
              <SelectItem value="EQUIPMENT">ادوات</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="الترتيب حسب" />
              {isFetching && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Loading className="h-[500px] flex items-center justify-center" />
      ) : isFetching ? (
        <div className="relative h-[500px]">
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
            <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">جاري تحميل المنتجات...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 opacity-30">
            {products?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-12 min-h-[600px] flex flex-col items-center justify-center">
          <h3 className="text-xl font-medium">مفيش منتجات حاليا</h3>
          <p className="text-muted-foreground mt-2">
            لا توجد منتجات متاحة حاليا. يرجى التحقق مرة أخرى لاحقًا أو تغيير
            معايير البحث.
          </p>
          <Button className="mt-4" onClick={resetFilters}>
            إعادة ضبط الفلاتر
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {products?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2 rtl:flex-row-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : ""
                    } w-9`}
                    onClick={() => handlePageChange(page)}
                    disabled={isFetching}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className="px-2">
                    {page}
                  </span>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
