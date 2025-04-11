"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Check if product is new (less than 14 days old)
  const isNew = product.createdAt
    ? new Date().getTime() - new Date(product.createdAt).getTime() <
      14 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-primary/50 group">
      <div className="aspect-square relative bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isNew && (
              <Badge className="absolute top-2 right-2 bg-primary text-white">
                New
              </Badge>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
            No image
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <Link
          href={`/products/${product.id}`}
          className="hover:text-primary transition-colors"
        >
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description || "No description available"}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex items-center justify-between border-t border-gray-100">
        <div className="font-bold text-lg">EGP {product.price.toFixed(2)}</div>
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="transition-all hover:scale-105 rounded-full px-4 flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-md"
          variant="default"
        >
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
