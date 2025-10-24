"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@mui/material";

async function fetchCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

async function deleteCategory(id: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmed) return;

    deleteMutation.mutate(id);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load categories</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      <div className="flex justify-end mb-4">
        <Link href="/admin/categories/create">
          <Button variant="contained" color="primary">
            + Add Category
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div
            key={cat.id}
            className="bg-white border rounded-lg shadow p-6 flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold">{cat.name}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {cat._count.products} products
            </p>

            <div className="flex gap-2 mt-4">
              <Link href={`/admin/categories/edit/${cat.id}`}>
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </Link>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
