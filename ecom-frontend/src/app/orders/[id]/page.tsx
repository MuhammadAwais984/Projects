"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
} from "@mui/material";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );

  if (!order) return <Typography>No order found</Typography>;

  // status colors
  const statusColors: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
    PENDING: "warning",
    PAID: "success",
    SHIPPED: "info",
    CANCELED: "error",
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Order Header */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold">
            Order #{order.id}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            mt={1}
          >
            <Chip
              label={order.status}
              color={statusColors[order.status] || "default"}
              sx={{ fontWeight: "bold" }}
            />
            <Typography variant="body1" fontWeight="bold">
              Total: Rs {order.totalPrice}
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Delivery Address:</strong> {order.address}
          </Typography>
        </CardContent>
      </Card>

      {/* Products */}
      <Typography variant="h6" gutterBottom>
        Ordered Products
      </Typography>
      <Stack spacing={2}>
        {order.items.map((item: any) => (
          <Card
            key={item.id}
            sx={{ borderRadius: 3, boxShadow: 1, overflow: "hidden" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                component="img"
                src={item.product.images?.[0]?.url || "/placeholder.png"}
                alt={item.product.name}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              />
              <Box flex={1}>
                <Typography fontWeight="bold">{item.product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: Rs {item.product.price * item.quantity}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
