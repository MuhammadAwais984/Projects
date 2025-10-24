"use client";

import {
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UpdatePassword() {
  const router = useRouter();
  const { token, login } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleUpdatePassword = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("New Password do not MAtch");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Password update failed");
        return;
      }
      const updatedUser = await res.json();
      login(updatedUser, token!);
      alert("Password Updated Successfully!");
      router.push("/profile");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Container  sx={{ mt: 12 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" mt={4}>
          Change Password
        </Typography>
        <Stack spacing={3} mt={2}>
          <TextField
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
