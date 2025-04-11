"use client";

import Image from "next/image";
import { Product } from "@prisma/client";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl || undefined,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity}) has been added to your cart.`,
    });

    // Reset quantity after adding to cart
    setQuantity(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-square relative bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-4 text-2xl font-semibold">
          EGP {product.price.toFixed(2)}
        </div>

        {product.stock > 0 ? (
          <div className="text-green-600 mt-2">
            In Stock ({product.stock} available)
          </div>
        ) : (
          <div className="text-red-600 mt-2">Out of Stock</div>
        )}

        <div className="mt-6">
          <p className="text-muted-foreground">
            {product.description || "No description available"}
          </p>
        </div>

        {product.stock > 0 && (
          <>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={handleAddToCart} className="flex-1">
                Add to Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
