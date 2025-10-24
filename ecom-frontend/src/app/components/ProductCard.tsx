"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 380, // keeps all cards same height
        maxHeight: 380, // prevents long names from stretching
      }}
    >
      {/* Image container */}
      <Box
        sx={{
          width: "100%",
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f9f9f9",
          overflow: "hidden",
        }}
      >
        <img
          src={product.images?.[0]?.url || product.imageUrl}
          alt={product.name}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2, // show max 2 lines
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "3rem", // keeps space aligned
          }}
        >
          {product.name}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Rs {product.price}
        </Typography>
      </CardContent>

      {/* Button */}
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push(`/products/${product.id}`)}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
}
