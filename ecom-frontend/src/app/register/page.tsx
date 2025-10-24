"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone, address }),
        }
      );
      if (!name || !email || !password || !phone || !address) {
        alert("Please fill in all fields");
      }

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message);
        return;
      }

      const data = await res.json();
      alert("Registration successful. Please log in.");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
    router.push("/login"); // redirect to login page
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 6,
        p: 4,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Register
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Phone"
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />
        <TextField
          label="Address"
          type="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <Button variant="contained" color="success" onClick={handleRegister}>
          Register
        </Button>
      </Stack>
    </Box>
  );
}
