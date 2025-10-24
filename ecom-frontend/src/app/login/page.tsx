"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const { login } = useAuth();

  const handleLogin = async () => {
    // Validate empty fields
    if (email === "" || password === "") {
      setSnackbarMessage("Please fill in all fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        setSnackbarMessage("Email not found. Please register first.");
      } else if (res.status === 401) {
        setSnackbarMessage("Incorrect password. Try again.");
      } else {
        setSnackbarMessage("Login failed. Please try again.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const data = await res.json();
    //console.log(data); // Check the exact structure

    const token = data.access_token;

    if (!token) {
      setSnackbarMessage("Login failed: token missing");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    localStorage.setItem("token", token);
    //console.log("Received token:", localStorage.getItem("token"));
    
    login(data.user, token); // Adjust based on actual response structure
    localStorage.setItem("role", data.user.role);
   
    setSnackbarMessage("Login successful!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    setTimeout(() => {
      router.push("/"); // redirect after showing success
    }, 1000);
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
        Login
      </Typography>

      <Stack spacing={2}>
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

        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Stack>

      <Typography mt={2} textAlign="center">
        Don't have an account?{" "}
        <MuiLink
          component={NextLink}
          href="/register"
          underline="hover"
          color="primary"
        >
          Register here
        </MuiLink>
      </Typography>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
