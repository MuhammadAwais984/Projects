"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardMedia,
} from "@mui/material";
import { Token } from "@mui/icons-material";

export default function AddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryName: "",
    imageFiles: [] as File[], // ✅ multiple images
  });

  const [newCategory, setNewCategory] = useState("");
  const [categoryDropdown, setCategoryDropdown] = useState<string | null>(null);
  const [openAlert, setOpenAlert] = useState(false);

  // ✅ Fetch categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = localStorage.getItem("token"); // or sessionStorage/cookies
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // ✅ Mutation to add product
  const addProductMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append(
        "categoryName",
        categoryDropdown === "__new__" ? newCategory : formData.categoryName
      );
      data.append("price", formData.price.toString());

      // append multiple images
      formData.imageFiles.forEach((file) => {
        data.append("files", file);
      });

      const token = localStorage.getItem("token"); // ✅ get token here

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ add JWT header
          },
          body: data,
        }
      );

      if (!res.ok) throw new Error("Failed to add product");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpenAlert(true);
      setTimeout(() => router.push(`/admin/products`), 1500);
    },
    onError: () => {
      alert("Failed to add product. Try again.");
    },
  });

  const handleSubmit = () => addProductMutation.mutate();

  // ✅ Handle adding one image at a time
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, e.target.files![0]],
      }));
    }
  };

  return (
    <Box className="p-6 max-w-lg mx-auto flex flex-col gap-4">
      <Typography variant="h5" fontWeight="bold">
        Add New Product
      </Typography>

      <TextField
        label="Name"
        value={formData.name}
        fullWidth
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <TextField
        label="Description"
        value={formData.description}
        fullWidth
        multiline
        rows={3}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      {catLoading ? (
        <CircularProgress size={24} />
      ) : (
        <TextField
          select
          label="Category"
          value={categoryDropdown || formData.categoryName}
          onChange={(e) => {
            setCategoryDropdown(e.target.value);
            if (e.target.value !== "__new__") {
              setFormData({ ...formData, categoryName: e.target.value });
            }
          }}
          fullWidth
          required
        >
          {categories.map((cat: any) => (
            <MenuItem key={cat.id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
          <MenuItem value="__new__">+ Add New Category</MenuItem>
        </TextField>
      )}

      {categoryDropdown === "__new__" && (
        <TextField
          label="New Category Name"
          value={newCategory}
          fullWidth
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
      )}

      <TextField
        label="Price"
        type="number"
        value={formData.price}
        fullWidth
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />

      {/* ✅ Preview selected images */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {formData.imageFiles.map((file, index) => (
          <Card key={index} sx={{ width: 80, height: 80 }}>
            <CardMedia
              component="img"
              image={URL.createObjectURL(file)}
              alt={`preview-${index}`}
              sx={{ objectFit: "cover", height: "100%" }}
            />
          </Card>
        ))}
      </Box>

      {/* ✅ Add one image at a time */}
      <Button variant="outlined" component="label">
        + Add Image
        <input type="file" hidden accept="image/*" onChange={handleFileAdd} />
      </Button>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={addProductMutation.isLoading}
      >
        {addProductMutation.isLoading ? "Adding..." : "Add Product"}
      </Button>

      {/* ✅ Success Snackbar */}
      <Snackbar
        open={openAlert}
        autoHideDuration={1500}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setOpenAlert(false)}
        >
          Product added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
