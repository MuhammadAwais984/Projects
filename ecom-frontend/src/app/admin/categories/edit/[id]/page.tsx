"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams(); // get [id] from URL
  const id = params?.id;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch category by id
  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`);
        const data = await res.json();
        setName(data.name);
        setSlug(data.slug);
      } catch (err) {
        alert("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  // Handle update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (!res.ok) {
      alert("Failed to update category");
      return;
    }

    alert("Category updated successfully!");
    router.push("/admin/categories");
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 6, p: 4, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
        Edit Category
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Update
        </Button>
      </form>
    </Box>
  );
}
