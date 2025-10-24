"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Tabs,
  Tab,
  Box,
} from "@mui/material";

// --- API calls
async function fetchCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function fetchProductsByCategory(categoryId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/products`
  );
  if (!res.ok) throw new Error("Failed to fetch products by category");
  return res.json();
}

export default function ManageProductsPage() {
  const qc = useQueryClient();

  // load categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // pick initial category once categories are loaded
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  useEffect(() => {
    if (categories.length && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // load products for the selected category
  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ["category-products", selectedCategory],
    queryFn: () => fetchProductsByCategory(selectedCategory as number),
    enabled: selectedCategory !== null,
  });

  // --- CRUD state
  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
    categoryId: "", // keep as string for TextField select, convert before send
  });

  // open Add modal prefilled with current category
  const openAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      imageUrl: "",
      categoryId: selectedCategory ? String(selectedCategory) : "",
    });
    setOpenForm(true);
  };

  // open Edit modal
  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name ?? "",
      price: p.price ?? "",
      imageUrl: p.images?.[0]?.url || p.imageUrl || "",
      categoryId: String(p.categoryId ?? selectedCategory ?? ""),
    });
    setOpenForm(true);
  };

  // add/update
  const addOrUpdateMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("price", formData.price);
      const catName = categories.find(
        (c) => c.id === Number(formData.categoryId)
      )?.name;
      fd.append("categoryName", catName || "");

      if (files.length > 0) {
        fd.append("file", files[0]); // single file for update
      }

      const url = editingProduct
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/update/${editingProduct.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products/upload`;

      const res = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to add/update product");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["category-products", selectedCategory],
      });
      setOpenForm(false);
      setEditingProduct(null);
      setFormData({ name: "", price: "", imageUrl: "", categoryId: "" });
      setFiles([]);
    },
  });

  // delete
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!confirmed) return; // if Cancel, stop here
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["category-products", selectedCategory],
      }),
  });

  const selectedCategoryName = useMemo(
    () => categories.find((c: any) => c.id === selectedCategory)?.name || "",
    [categories, selectedCategory]
  );

  if (catLoading) return <p className="p-6">Loading categories…</p>;
  if (!categories.length) return <p className="p-6">No categories found.</p>;
  if (prodLoading) return <p className="p-6">Loading products…</p>;

  return (
    <div className="p-6">
      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onChange={(_, val) => setSelectedCategory(val)}
        aria-label="Category tabs"
      >
        {categories.map((cat: any) => (
          <Tab key={cat.id} value={cat.id} label={cat.name} />
        ))}
      </Tabs>

      <div className="flex items-center justify-between mt-4">
        <Typography variant="h6">Products in {selectedCategoryName}</Typography>
        <Button variant="contained" href="/admin/products/add">
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <Grid container spacing={4} className="mt-2">
        {products.map((product: any) => {
          const img = product.images?.[0]?.url || product.imageUrl || "";
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card className="shadow-lg">
                <CardMedia
                  component="img"
                  height="200"
                  image={img}
                  alt={product.name}
                  style={{ height: 200, backgroundColor: "white" }}
                />
                <CardContent>
                  <Typography variant="h6" className="truncate">
                    {product.name}
                  </Typography>
                  <Typography>Rs {product.price}</Typography>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outlined"
                      href={`/admin/products/edit/${product.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteMutation.mutate(product.id)}
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 w-96 h-96 mt-8">
          <Box className="flex flex-col gap-4 mt-5">
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              fullWidth
            />
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files));
                }
              }}
            />

            {/* Category select (defaults to current tab) */}
            <TextField
              select
              label="Category"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={() => addOrUpdateMutation.mutate()}
            variant="contained"
          >
            {editingProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
