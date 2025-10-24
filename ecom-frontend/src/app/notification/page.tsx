"use client";
import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, Divider } from "@mui/material";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading notifications...</Typography>;

  if (!notifications.length)
    return <Typography>No notifications yet</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Notifications
      </Typography>
      <List>
        {notifications.map((note) => (
          <Box key={note.id}>
            <ListItem>
              <Typography>
                {note.message}{" "}
                {note.order && `— Order #${note.order.id} | Rs ${note.order.totalPrice}`}
              </Typography>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  );
}
