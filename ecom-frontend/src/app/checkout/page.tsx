"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";


export default function CheckoutForm({
  onClose,
  product, // ✅ single product (direct order)
  cartItems: initialCartItems,
  quantity: initialQuantity = 1, // ✅ if already passed from Cart page
}: {
  onClose: () => void;
  product?: any;
  cartItems?: any[];
  quantity?: number;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [address, setAddress] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>(initialCartItems || []);
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isGuest = !token;
  useEffect(() => {
    if (!isGuest) {
      // ✅ Logged-in user
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setAddress("");
        })
        .catch(console.error);

      // ✅ Fetch cart if not provided
      if (!product && !initialCartItems) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setCartItems(data))
          .catch(console.error);
      }

      // ✅ If product is passed
      if (product) {
        setCartItems([{ product, quantity: initialQuantity }]);
      }
    } else {
      // ✅ Guest checkout, just set the product
      if (product) {
        setCartItems([{ product, quantity: initialQuantity }]);
      }
    }
  }, [product, initialCartItems, isGuest, token]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  const handleSubmit = async () => {
    try {
      if (isGuest) {
        // ✅ Guest order
        if (
          !guestForm.name ||
          !guestForm.email ||
          !guestForm.phone ||
          !guestForm.address
        ) {
          alert("Please fill all fields");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/guest`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...guestForm,
              paymentMethod,
              items: cartItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
              })),
            }),
          }
        );

        if (!res.ok) throw new Error("Guest order failed");
        const data = await res.json(); // 👈 backend should return { id: orderId, ... }

        // ✅ Save orderId + phone for later use (GuestOrdersPage)
        Cookies.set("guestToken", data.guestToken, { expires: 365 });

        alert("Order confirmed!");
        localStorage.removeItem("guest_cart");
        setCartItems([]);
        onClose();
        router.push("/orders/guest-orders");
      } else {
        // ✅ Logged-in user order
        if (product) {
          if (address.trim() === "") {
            alert("Please add an address");
            return;
          }
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: product.id,
              quantity: initialQuantity,
            }),
          });
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address, paymentMethod }),
        });

        if (!res.ok) throw new Error("Order failed");

        alert("Order confirmed!");
        onClose();
        router.push("/orders");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };
  return (
    <Box
      sx={{
        p: { xs: 4, sm: 4 },
        border: "1px solid #ccc",
        borderRadius: 2,
        width: "100%",
        maxWidth: 500,
        bgcolor: "white",
        mx: 5,
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={2}>
        Confirm Your Order
      </Typography>

      {isGuest ? (
        <>
          <TextField
            label="Full Name"
            fullWidth
            value={guestForm.name}
            onChange={(e) =>
              setGuestForm({ ...guestForm, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={guestForm.email}
            onChange={(e) =>
              setGuestForm({ ...guestForm, email: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Phone"
            fullWidth
            value={guestForm.phone}
            onChange={(e) =>
              setGuestForm({ ...guestForm, phone: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Address"
            fullWidth
            value={guestForm.address}
            onChange={(e) =>
              setGuestForm({ ...guestForm, address: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </>
      ) : (
        <>
          <Typography>
            <strong>Name:</strong> {user?.name}
          </Typography>
          <Typography>
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {user?.phone || "N/A"}
          </Typography>

          <FormLabel sx={{ mt: 2 }}>Choose Shipping Address</FormLabel>
          <TextField
            select
            label="Shipping Address"
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ my: 2 }}
          >
            <option value=""></option>
            {user?.addresses?.map((addr) => (
              <option key={addr.id} value={addr.address}>
                {addr.address}
              </option>
            ))}
          </TextField>
        </>
      )}

      <FormLabel>Payment Method</FormLabel>
      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <FormControlLabel
          value="COD"
          control={<Radio />}
          label="Cash on Delivery"
        />
        <FormControlLabel
          value="ONLINE"
          control={<Radio />}
          label="Online Payment"
        />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" fontWeight={600}>
        Order Summary
      </Typography>
      <Stack spacing={1} maxHeight={200} overflow="auto">
        {cartItems.map((item, i) => (
          <Box key={i} display="flex" justifyContent="space-between">
            <Typography>
              {item.product.name} × {item.quantity}
            </Typography>
            <Typography>Rs {item.product.price * item.quantity}</Typography>
          </Box>
        ))}
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Typography fontWeight={600} textAlign="right">
        Total: Rs {totalPrice}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
        fullWidth
      >
        Confirm Order
      </Button>
    </Box>
  );
}
