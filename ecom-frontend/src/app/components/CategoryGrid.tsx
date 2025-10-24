"use client";

import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getCategoryIcon } from "./iconMapper";

async function fetchCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export default function HomePage() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <CircularProgress size={150} />
        <p className="font-semibold">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-red-500">
          Failed to load categories
        </p>
      </div>
    );

  return (
    <div className="bg-gray-100 p-10 flex items-center justify-center">
      <div className="text-center max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="block p-6 rounded-full shadow border border-slate-300 hover:text-center 
           transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              <div className="mb-2 text-black-500 flex justify-center">
                {getCategoryIcon(cat.name)}
              </div>
              <h2 className="text-xl font-semibold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">
                {cat._count.products} products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
