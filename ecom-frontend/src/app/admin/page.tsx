"use client";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <Box sx={{ p: 6 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Admin Dashboard
        </Typography>
        {user?.role === "SUPER_ADMIN" && (
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            href="/admin/create"
            sx={{ mb: 4 }}
          >
            Add Admin User
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Categories Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h6" mb={2}>
                Categories
              </Typography>
              <Link href="/admin/categories">
                <Button variant="contained">Manage Categories</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* Products Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h6" mb={2}>
                Products
              </Typography>
              <Link href="/admin/products">
                <Button variant="contained">Manage Products</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h6" mb={2}>
                Orders
              </Typography>
              <Link href="/admin/orders">
                <Button variant="contained">View Orders</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        {/* Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <Typography variant="h6" mb={2}>
                Users
              </Typography>
              <Link href="/admin/users">
                <Button variant="contained">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
