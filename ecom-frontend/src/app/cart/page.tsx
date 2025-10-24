"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  IconButton,
  Box,
  Dialog,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckoutForm from "../checkout/page";

export default function Cart() {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const fetchCart = async () => {
    if (token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error(error);
      }
    } else {
      const guestCart = localStorage.getItem("guest_cart");
      if (guestCart) {
        const parsed = JSON.parse(guestCart);

        const shaped = parsed.map((item: any, index: number) => ({
          id: item.id || index, // unique React key
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price) || 0,
            images: item.product.images?.length
              ? item.product.images
              : [{ url: item.product.imageUrl || "/placeholder.png" }],
          },
        }));

        setCartItems(shaped);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return; // prevent quantity < 1
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      // Update locally
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Guest remove
  const removeItem = async (productId: number) => {
    if (token) {
      // logged in remove
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems((prev) =>
          prev.filter((item) => item.productId !== productId)
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      // guest remove
      const updatedCart = cartItems.filter(
        (item) => item.productId !== productId
      );
      setCartItems(updatedCart);
      localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      {cartItems.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="400px"
          textAlign="center"
        >
          <Box
            component="img"
            src="/99207d54005817ed68df429b0d68148d.jpg"
            alt="Empty Cart"
            sx={{ width: 300, height: 300, mb: 3, objectFit: "contain" }}
          />
          <Typography variant="h5">Your Cart is Empty</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {cartItems.map((item) => (
            <Paper key={item.id} sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <img
                  src={item.product.images?.[0]?.url || "/placeholder.png"}
                  alt={item.product.name}
                  style={{ width: 100, height: 100, objectFit: "contain" }}
                />
                <Stack flex={1}>
                  <Typography variant="h6">{item.product.name}</Typography>
                  <Typography>Price: Rs {item.product.price}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </Button>
              </Stack>
            </Paper>
          ))}

          <Divider sx={{ mt: 2, mb: 2 }} />
          <Paper sx={{ p: 2, borderRadius: 10, boxShadow: 3 }}>
            <Box padding={2}>
              <Typography variant="h4" fontWeight={700}>
                Summary
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                paddingTop={5}
              >
                <Typography variant="h6">
                  Total Items:{" "}
                  <span style={{ fontWeight: "bold" }}>{totalItems}</span>
                </Typography>
                <Typography variant="h6">
                  Total Price:{" "}
                  <span style={{ fontWeight: "bold" }}> Rs {totalPrice}</span>
                </Typography>
              </Stack>
            </Box>
          </Paper>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => {
              // Always allow opening CheckoutForm, even for guest
              setOpen(true);
            }}
          >
            Proceed to Checkout
          </Button>
          

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
                cartItems={cartItems}
              />
            </Box>
          </Modal>

          <Dialog
            open={loginPrompt}
            onClose={() => setLoginPrompt(false)}
            fullWidth
            maxWidth="xs"
          >
            <Box p={3} textAlign="center">
              <Typography variant="h6" gutterBottom>
                Please login or register first
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => (window.location.href = "/login")}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = "/register")}
                >
                  Register
                </Button>
              </Stack>
            </Box>
          </Dialog>
        </Stack>
      )}
    </Container>
  );
}
