"use client";
import { Box, TextField, Autocomplete } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products as user types
  useEffect(() => {
    if (search.trim() === "") {
      setProducts([]);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(
            search
          )}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [search]);

  return (
    <section
      className="relative flex items-center justify-center h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/e711f125d6d0ba439afbd064615f56da.jpg')" }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>

      {/* content */}
      <div
        className="
          relative z-10 
          text-white 
          px-4 
          max-w-3xl 
          text-center md:text-left 
          flex flex-col 
          items-center md:items-start
          bottom-10
        "
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
          Welcome to Our Store
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-4 md:mb-6">
          Discover amazing products at the best prices!
        </p>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
            mt: 2,
          }}
        >
          <Autocomplete
            freeSolo
            options={products}
            getOptionLabel={(option: any) => option.name}
            inputValue={search}
            onInputChange={(e, newValue) => setSearch(newValue)}
            onChange={(e, value) => {
              if (value) router.push(`/products/${value.id}`);
            }}
            sx={{ width: { xs: 250, sm: 350, md: 400 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search products..."
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: 50,
                  "& .MuiOutlinedInput-root": { borderRadius: 50 },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                }}
              />
            )}
          />
        </Box>
      </div>
    </section>
  );
}
