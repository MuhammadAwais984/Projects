"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Box,
  Divider,
  Grid,
  CardContent,
  Card,
  Button,
} from "@mui/material";

type Order = {
  id: number;
  status: string;
  // add more fields if needed
};

type UserData = {
  name: string;
  email: string;
  phone?: string;
  addresses?: { id: number; address: string }[];
  orders?: Order[];
};

export default function ProfileView() {
  const { token } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    addresses: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return; // user not logged in

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch user data");
        }

        const data: UserData = await res.json();
        setUserData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleDeleteAddress = async (addressId: number) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/address/${addressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete address");

      // Remove from local state
      setUserData((prev) => ({
        ...prev,
        addresses: prev.addresses?.filter((a) => a.id !== addressId),
      }));
    } catch (err) {
      console.error(err);
      alert("Could not delete address");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <CircularProgress size={150} />
        <p className="font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ mt: 6 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 4,
          width: "100%",
          maxWidth: 1000,
        }}
      >
        <Stack spacing={3}>
          {/* User Info */}
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            {userData.name || "User"}
          </Typography>
          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">{userData.email}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {userData.phone || "Not provided"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined"></Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Addresses
                  </Typography>
                  {userData.addresses && userData.addresses.length > 0 ? (
                    <Box
                      component="ul"
                      sx={{ pl: 3, m: 0, listStyleType: "disc" }}
                    >
                      {userData.addresses.map((addr) => (
                        <li
                          key={addr.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Typography variant="body1">
                            {addr.address}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            Delete
                          </Button>
                        </li>
                      ))}
                    </Box>
                  ) : (
                    <Typography>No addresses saved</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Password
                  </Typography>
                  <Typography variant="body1">********</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Orders */}
          <Typography variant="h5" mt={2} fontWeight="bold">
            My Orders
          </Typography>
          <Divider />
          <Stack spacing={2}>
            {userData.orders && userData.orders.length > 0 ? (
              userData.orders.map((order) => (
                <Card key={order.id} variant="outlined">
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" }, // ✅ column on mobile, row on larger screens
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 1, // adds small space between text and button on mobile
                    }}
                  >
                    <Typography variant="subtitle1">
                      Order #{order.id} - {order.status}
                    </Typography>
                    <Button variant="outlined" href={`/orders/${order.id}`}>
                      View Order
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography>No orders found</Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
