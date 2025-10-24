"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

export default function GuestOrdersPage() {
  const [order, setOrder] = useState<any | null>(null);
  const guestToken = cookies.get("guestToken");
  useEffect(() => {
    const fetchOrders = async () => {
      if (!guestToken) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/guest/orders/${guestToken}`
      );
      const data = await res.json();
      setOrder(data[0] || null); // first order, or show a list if you want
    };
    fetchOrders();
  }, [guestToken]);

  const handleCancel = async () => {
    const confirmed = window.confirm("Cancel this order?");
    if (!confirmed) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/guest/${order.id}/cancel`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestToken }),
      }
    );

    if (!res.ok) {
      alert("Failed to cancel order");
      return;
    }

    alert("Order canceled");
    setOrder((prev: any) => ({ ...prev, status: "CANCELED" }));
  };

  if (!order) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">No order found.</Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "CANCELED":
        return "red";
      case "DELIVERED":
        return "green";
      case "SHIPPED":
        return "blue";
      default:
        return "inherit";
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" textAlign="center" mb={3}>
        My Order
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order #{order.id}
          </Typography>
          <Typography>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  order.status === "PENDING"
                    ? "orange"
                    : order.status === "CANCELED"
                    ? "red"
                    : order.status === "DELIVERD"
                    ? "green"
                    : order.status === "SHIPPED"
                    ? "blue"
                    : "inherit",
                fontWeight: "bold",
              }}
            >
              {order.status}
            </span>
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Products:
          </Typography>

          <Stack spacing={2} mb={2}>
            {order.items.map((item: any) => (
              <Box
                key={item.id}
                display="flex"
                alignItems="center"
                gap={2}
                sx={{
                  p: 1.5,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                }}
              >
                <img
                  src={item.product.images?.[0]?.url || "/placeholder.png"}
                  alt={item.product.name}
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "contain",
                    borderRadius: 8,
                    backgroundColor: "white",
                  }}
                />
                <Box>
                  <Typography fontWeight="bold">{item.product.name}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Typography>
                    Price: Rs {item.product.price * item.quantity}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography>
            <strong>Total Price:</strong> Rs {order.totalPrice}
          </Typography>
          <Typography>
            <strong>Address:</strong> {order.address}
          </Typography>

          {order.status === "PENDING" && (
            <Button
              color="error"
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleCancel}
              fullWidth
            >
              Cancel Order
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
