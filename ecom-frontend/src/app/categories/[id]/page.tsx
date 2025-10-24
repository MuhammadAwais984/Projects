"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button, CircularProgress, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";

async function fetchProductsByCategory(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}/products`
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function CategoryPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["category-products", id],
    queryFn: () => fetchProductsByCategory(id as string),
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <CircularProgress size={80} />
        <p className="font-semibold mt-4">Loading...</p>
      </div>
    );

  if (error) return <p className="text-center mt-10">Failed to load products</p>;

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="border rounded-xl shadow-md bg-white 
                       transition-transform duration-300 hover:scale-105 hover:shadow-lg flex flex-col"
          >
            <Link href={`/products/${product.id}`} passHref>
              <div className="flex justify-center items-center p-4">
                <img
                  src={product.images?.[0]?.url || product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-contain rounded"
                />
              </div>
              <Divider />
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold truncate">
                  {product.name}
                </h2>
                <p className="text-gray-600 mt-1">Rs {product.price}</p>
              </div>
            </Link>

            <div className="flex flex-col sm:flex-row justify-center gap-2 p-4">
              <Link href={`/products/${product.id}`} passHref>
                <Button variant="contained" fullWidth>
                  View
                </Button>
              </Link>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
