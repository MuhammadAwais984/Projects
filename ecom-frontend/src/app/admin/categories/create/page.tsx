"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (!res.ok) {
      alert("Failed to create category");
      return;
    }

    alert("Category created successfully!");
    router.push("/admin/categories"); // back to categories list
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 6, p: 4, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
        Add New Category
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
          Create
        </Button>
      </form>
    </Box>
  );
}
