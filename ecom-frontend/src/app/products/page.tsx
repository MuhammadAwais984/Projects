// src/app/products/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid, CircularProgress, Typography, Container } from "@mui/material";
import ProductCard from "../components/ProductCard";

async function fetchProducts(search?: string) {
  const url = search
    ? `${process.env.NEXT_PUBLIC_API_URL}/products?search=${search}`
    : `${process.env.NEXT_PUBLIC_API_URL}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => fetchProducts(searchQuery),
  });

  if (isLoading)
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress size={60} />
      </div>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center" mt={5}>
        Failed to load products
      </Typography>
    );

  if (!data || data.length === 0)
    return (
      <Typography textAlign="center" mt={5}>
        No products found
      </Typography>
    );

  return (
    <Container  className="p-4 sm:p-6">
      <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((product: any) => (
          <div
            key={product.id}
            className="border rounded-xl shadow-md bg-white 
                       transition-transform duration-300 hover:scale-105 hover:shadow-lg flex flex-col"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Container>
  );
}
