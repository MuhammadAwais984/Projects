"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Card,
  CardMedia,
  Typography,
  Divider,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Modal,
  Paper,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckoutForm from "@/app/checkout/page";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

async function fetchProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [authPopup, setAuthPopup] = useState(false);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id as string),
  });

  const [mainImageIndex, setMainImageIndex] = useState(0); // Track selected image

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <CircularProgress size={150} />
        <p className="font-semibold">Loading...</p>
      </div>
    );
  if (error)
    return <Typography color="error">Failed to load product</Typography>;

  const images = product.images?.length
    ? product.images
    : [{ url: product.imageUrl }];

  const handlePrev = () => {
    setMainImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setMainImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const handleBuyNow = () => {
    setOpen(true);
  };

  /*  const addToCart = async (productId: number) => {
    if (!token) {
      alert("Please Login First");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to add to cart");
        return;
      }
    } catch (error) {
      console.log(error);
      alert("Something Went Wrong!");
    }
  };*/

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
      <Grid
        container
        spacing={4}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {/* Left side - images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Card
              sx={{
                width: 500, // fixed width
                p: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                image={images[mainImageIndex]?.url || "/no-image.png"}
                alt={product.name}
                sx={{ height: 400, objectFit: "contain", borderRadius: 2 }}
              />

              {images.length > 1 && (
                <>
                  <IconButton
                    sx={{ position: "absolute", top: "50%", left: 0 }}
                    onClick={handlePrev}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                  <IconButton
                    sx={{ position: "absolute", top: "50%", right: 0 }}
                    onClick={handleNext}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Card>
          </Box>

          {/* Thumbnail carousel */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              overflowX: "auto",
              justifyContent: "center",
            }}
          >
            {images.map((img: any, idx: number) => (
              <Card
                key={idx}
                sx={{
                  width: 80,
                  height: 80,
                  border:
                    mainImageIndex === idx
                      ? "2px solid #1976d2"
                      : "1px solid #ccc",
                  cursor: "pointer",
                }}
                onClick={() => setMainImageIndex(idx)}
              >
                <CardMedia
                  component="img"
                  image={img.url || "/no-image.png"}
                  alt={`${product.name}-thumb-${idx}`}
                  sx={{ objectFit: "cover" }}
                />
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Right side - details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight="bold">
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {product.description}
          </Typography>

          <Typography variant="h5" sx={{ mt: 3, fontWeight: "bold" }}>
            Rs {product.price}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Category: {product.category?.name}
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <IconButton onClick={decreaseQty}>
              <RemoveIcon />
            </IconButton>
            <Typography>{quantity}</Typography>
            <IconButton onClick={increaseQty}>
              <AddIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => addToCart(product, quantity)}
            >
              Add to Cart
            </Button>

            <Button variant="outlined" color="secondary" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </Box>
        </Grid>
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CheckoutForm
              onClose={() => setOpen(false)}
              product={product} // ✅ pass product
              quantity={quantity} // ✅ pass current quantity
            />
          </Box>
        </Modal>
        <Modal open={authPopup} onClose={() => setAuthPopup(false)}>
          <Box
            sx={{
              bgcolor: "white",
              p: 4,
              borderRadius: 2,
              textAlign: "center",
              minWidth: 300,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Please login or register first
            </Typography>
            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              <Button variant="contained" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Modal>
      </Grid>
    </Box>
  );
}
