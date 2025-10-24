"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "@/app/context/AuthContext";

type UserType = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN";
  createdAt: string;
};

export default function UsersPage() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);

  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<
    "ADMIN" | "CUSTOMER" | "SUPER_ADMIN"
  >("CUSTOMER");

  // Fetch users
  const fetchUsers = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) setUsers(data);
      else if (Array.isArray(data.users)) setUsers(data.users);
      else setUsers([]);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  // Delete user
  const handleDelete = async (id: number) => {
    if (!token) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return; // if Cancel, stop here

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.message); // ❌ Show backend message
        return;
      }

      fetchUsers(); // refresh table
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing
  const startEdit = (user: UserType) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  // Save edited user
  const saveEdit = async () => {
    if (!editingUser || !token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        role: editRole,
      }),
    });

    setEditingUser(null);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h4" mb={4}>
        Available Users
      </Typography>

      {/* Edit form */}
      {editingUser && (
        <Box sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Typography variant="h6">Edit User: {editingUser.name}</Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <TextField
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
            />
            <TextField
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
            />
            <Select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as any)}
            >
              <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
            </Select>
            <Button variant="contained" color="primary" onClick={saveEdit}>
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "gray" }}>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {/* Edit button */}
                  {user.id !== currentUser?.id &&
                    (currentUser?.role === "SUPER_ADMIN" ||
                      (currentUser?.role === "ADMIN" &&
                        user.role === "CUSTOMER")) && (
                      <IconButton
                        color="primary"
                        onClick={() => startEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}

                  {/* Delete button */}
                  {user.id !== currentUser?.id &&
                    (currentUser?.role === "SUPER_ADMIN" ||
                      (currentUser?.role === "ADMIN" &&
                        user.role === "CUSTOMER")) && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No users found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
