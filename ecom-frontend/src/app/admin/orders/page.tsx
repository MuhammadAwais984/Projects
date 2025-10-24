"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  MenuItem,
  Select,
} from "@mui/material";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Status update failed");

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: updated.status } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (orderId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${orderId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      alert("Order deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        All Orders
      </Typography>

      {orders.length === 0 && <Typography>No orders yet.</Typography>}

      <Stack spacing={3}>
        {orders.map((order) => (
          <Card key={order.id} sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography>
                <strong>Order ID:</strong> {order.id}
              </Typography>
              <Typography>
                <strong>User:</strong>{" "}
                {order.user
                  ? `${order.user.name} (${order.user.email})`
                  : `${order.guestName} (${order.guestEmail})`}
              </Typography>
              <Typography>
                <strong>Phone No:</strong>{" "}
                {order.user?.phone || order.guestPhone || "N/A"}
              </Typography>
              <Typography>
                <strong>Address</strong> {order.address}
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
              <Typography>
                <strong>Total:</strong> Rs {order.totalPrice}
              </Typography>
              <Typography>Change Order Status</Typography>
              <Select
                value={order.status}
                size="small"
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="DELIVERD">Deivered</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="CANCELED">Canceled</MenuItem>
              </Select>

              <Typography mt={2}>
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
                      <Typography>Qty: {item.quantity}</Typography>
                      <Typography>
                        Price: Rs {item.product.price * item.quantity}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => handleDelete(order.id)}
              >
                Delete Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
