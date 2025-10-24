"use client";

import {
  Container,
  Paper,
  TextField,
  Button,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { user, token, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || "");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.addresses?.[0]?.address || "")

    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Update failed");
      }
      const updatedUser = await res.json();
      login(updatedUser, token!);
      alert("Profile Updated");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      alert("Something Went Wrong!");
    }
    console.log("Updating:", { name, email, phone });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Stack alignItems="center" spacing={2}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
            {user?.name?.[0]}
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
        </Stack>

        {/* Profile Update Form */}
        <Stack spacing={3} mt={4}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <TextField
            label="Full Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />

          <Typography>
            If you want to change the password click
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
              href="/update-password"
            >
              Change Password
            </Button>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
            onClick={handleUpdateProfile}
          >
            Update Profile
          </Button>
        </Stack>

        {/* Password Update Form */}
      </Paper>
    </Container>
  );
}
