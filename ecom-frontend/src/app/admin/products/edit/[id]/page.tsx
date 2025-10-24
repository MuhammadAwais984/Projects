"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@mui/material";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryName: "",
    imageFiles: [] as File[], // new uploads
  });

  const [existingImages, setExistingImages] = useState<any[]>([]); // existing images
  const [openAlert, setOpenAlert] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch product details
  const { data: product, isLoading: prodLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: !!id,
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        categoryName: product.category?.name || "",
        imageFiles: [],
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  // Delete existing image
  const deleteImage = async (imageId: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/image/${imageId}`,
        { method: "DELETE" }
      );
      setExistingImages((prev) =>
        prev.filter((img) => img.id !== imageId)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  // Update product
  const updateProductMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("categoryName", formData.categoryName);
      data.append("price", formData.price);

      formData.imageFiles.forEach((file) => {
        data.append("files", file);
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/update/${id}`,
        { method: "PATCH", body: data }
      );

      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setExistingImages(updatedProduct.images || []);
      setFormData((prev) => ({ ...prev, imageFiles: [] }));
      setOpenAlert(true);
      setTimeout(() => router.push(`/admin/products`), 1500);
    },
    onError: () => {
      alert("Failed to update product. Try again.");
    },
  });

  const handleSubmit = () => updateProductMutation.mutate();

  if (prodLoading) return <Typography>Loading product...</Typography>;

  return (
    <Box className="p-6 max-w-lg mx-auto flex flex-col gap-4">
      <Typography variant="h5" fontWeight="bold">
        Edit Product
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
          value={formData.categoryName}
          onChange={(e) =>
            setFormData({ ...formData, categoryName: e.target.value })
          }
          fullWidth
          required
        >
          {categories.map((cat: any) => (
            <MenuItem key={cat.id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        label="Price"
        type="number"
        value={formData.price}
        fullWidth
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />

      {/* Existing images with delete */}
      {existingImages.length > 0 && (
        <Box className="flex gap-2 flex-wrap">
          {existingImages.map((img) => (
            <Box key={img.id} className="relative">
              <img
                src={img.url || img}
                alt="product-image"
                className="w-24 h-24 object-cover rounded"
              />
              <Button
                size="small"
                variant="contained"
                color="error"
                style={{ position: "absolute", top: 0, right: 0 }}
                onClick={() => deleteImage(img.id)}
              >
                X
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Upload new images */}
      <Button variant="outlined" component="label">
        Upload Image
        <input
          type="file"
          accept="image/*"
          hidden
          multiple
          onChange={(e) =>
            setFormData({
              ...formData,
              imageFiles: [
                ...formData.imageFiles,
                ...(Array.from(e.target.files || [])),
              ],
            })
          }
        />
      </Button>

      {/* Preview new uploads */}
      {formData.imageFiles.length > 0 && (
        <Box className="flex gap-2 flex-wrap mt-2">
          {formData.imageFiles.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt={`new-upload-${idx}`}
              className="w-24 h-24 object-cover rounded"
            />
          ))}
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={updateProductMutation.isLoading}
      >
        {updateProductMutation.isLoading ? "Updating..." : "Update Product"}
      </Button>

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
          Product updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
