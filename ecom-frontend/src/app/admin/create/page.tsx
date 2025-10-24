"use client";

import { useState } from "react";
import { Box, Button, Stack, TextField, Typography, Snackbar, Alert } from "@mui/material";

export default function CreateAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleCreateAdmin = async () => {
    const token = localStorage.getItem("token"); // ✅ Get token

    if (!token) {
      setSnackbarMessage("You must be logged in as admin");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/create-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ Send token
      },
      body: JSON.stringify({ name, email, password, cnic, phone }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        setSnackbarMessage("Unauthorized: Only Super admins can do this");
      } else {
        setSnackbarMessage("Failed to create admin");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage("Admin created successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setName("");
    setEmail("");
    setPassword("");
    setCnic("");
    setPhone("");
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 6, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Create Admin
      </Typography>

      <Stack spacing={2}>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
        <TextField label="CNIC" value={cnic} onChange={(e) => setCnic(e.target.value)} fullWidth />
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />

        <Button variant="contained" onClick={handleCreateAdmin}>
          Create Admin
        </Button>
      </Stack>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
