"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        // Ensure we only set array
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);
  const handleDelete = async (orderId: number) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order?"
      );
      if (!confirmed) return; // if Cancel, stop here
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }
      alert("Oredr cancelled");

      // Remove order from state so UI updates
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELED" } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" textAlign={"center"} mb={4}>
        My Orders
      </Typography>

      {orders.length === 0 && (
        <Typography variant="h6" textAlign={"center"}>
          No orders yet.
        </Typography>
      )}

      <Stack spacing={3}>
        {orders.map((order) => (
          <Card key={order.id} sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography>
                <strong>Order ID:</strong> {order.id}
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
                        : order.status === "DELIVERED"
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
              <Typography>
                <strong>Total Price:</strong> Rs {order.totalPrice}
              </Typography>
              <Typography>
                <strong>Address:</strong> {order.address}
              </Typography>
              <Typography mt={2} mb={1}>
                <strong>Products:</strong>
              </Typography>
              <Stack spacing={2}>
                {order.items.map((item: any) => (
                  <Box key={item.id} display="flex" alignItems="center" gap={2}>
                    <img
                      src={item.product.images?.[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        borderRadius: 5,
                      }}
                    />
                    <Box>
                      <Typography>{item.product.name}</Typography>
                      <Typography>Quantity: {item.quantity}</Typography>
                      <Typography>
                        Price: Rs {item.product.price * item.quantity}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              {order.status !== "CANCELED" && order.status !== "DELIVERED" && (
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={() => handleDelete(order.id)}
                >
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
