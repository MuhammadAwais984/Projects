"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  TextField,
  Box,
  Autocomplete,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Edit,
  Person,
  ShoppingBag,
  Store,
  Search,
  Menu as MenuIcon,
  AppRegistration,
  ManageAccounts,
  Notifications,
  Category,
  Redeem,
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Fetch suggestions while typing
  useEffect(() => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }
    const fetchSuggestions = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?search=${search}`
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    };
    fetchSuggestions();
  }, [search]);

  const handleSelect = (product: any) => {
    router.push(`/products/${product.id}`);
    setSearch("");
  };

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "#263238", color: "white", boxShadow: "none" }}
    >
      <Toolbar className="flex justify-between">
        {/* Left side */}
        <Typography variant="h6">
          <Link href="/">
            <Tooltip title="Home">
              <HomeIcon
                className="cursor-pointer hover:border-black text-center 
           transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              />
            </Tooltip>
          </Link>
        </Typography>

        {/* Middle search box - hidden on xs */}
        <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 2 }}>
          {" "}
          <Autocomplete
            freeSolo
            options={products}
            getOptionLabel={(option) => option.name || ""}
            onChange={(e, value) => value && handleSelect(value)}
            inputValue={search}
            onInputChange={(e, value) => setSearch(value)}
            sx={{
              width: { xs: 150, sm: 300, md: 400 },
              backgroundColor: "white",
              borderRadius: 50,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search products..."
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 50 },
                }}
              />
            )}
          />
        </Box>

        {/* Right side - hide buttons on mobile */}
        <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 2 }}>
          {!user ? (
            <>
              <IconButton color="inherit" href="/cart">
                <Tooltip title="Cart">
                  <Badge
                    badgeContent={totalItems}
                    color="error"
                    overlap="circular"
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </Tooltip>
              </IconButton>
              <Button href="/#categories" color="inherit">
                <Category /> Categories
              </Button>
              <Button color="inherit" href="/orders/guest-orders">
                Orders
              </Button>
              <Button color="inherit" href="/products">
                Shop
              </Button>
              <Button color="inherit" href="/login">
                <LogoutIcon /> Login
              </Button>
              <Button color="inherit" href="/register">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                href="/products"
                startIcon={<Store />} // 👈 use MUI startIcon prop instead of manual <Store />
                sx={{
                  textTransform: "none", // keep normal casing
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)", // subtle navbar hover
                    transform: "scale(1.05)",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Shop
              </Button>
              <Button
                startIcon={<Category />} // 👈 use MUI startIcon prop instead of manual <Store />
                sx={{
                  textTransform: "none", // keep normal casing
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)", // subtle navbar hover
                    transform: "scale(1.05)",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
                href="/#categories"
                color="inherit"
              >
                Categories
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/orders"
                startIcon={<ShoppingBag />} // 👈 use MUI startIcon prop instead of manual <Store />
                sx={{
                  textTransform: "none", // keep normal casing
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)", // subtle navbar hover
                    transform: "scale(1.05)",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Orders
              </Button>
              <IconButton color="inherit" href="/cart">
                <Tooltip title="Cart">
                  <Badge
                    badgeContent={totalItems}
                    color="error"
                    overlap="circular"
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </Tooltip>
              </IconButton>
              <IconButton href="/notification">
                <Notifications />
              </IconButton>

              {/* Profile dropdown */}
              <div>
                <Tooltip title="Profile">
                  <Avatar
                    alt={user.name}
                    src={"/default-avatar.png"}
                    sx={{ cursor: "pointer" }}
                    onClick={handleMenu}
                  />
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  disableScrollLock
                  PaperProps={{
                    sx: { mt: 1.5, minWidth: 250, borderRadius: 2, p: 1 },
                  }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <div className="flex items-center px-4 py-2">
                    <ListItemIcon>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {user?.name?.[0]}
                      </Avatar>
                    </ListItemIcon>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Divider />
                  <MenuItem onClick={handleClose}>
                    <Link href="/edit">
                      <Edit fontSize="small" style={{ marginRight: 8 }} />
                      Edit Profile
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Link href="/profile">
                      <Person fontSize="small" style={{ marginRight: 8 }} />
                      View Profile
                    </Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogout();
                    }}
                  >
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </div>

              {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <Link
                  href="/admin"
                  className="bg-slate-500 px-5 py-3 rounded-full hover:bg-gray-900"
                >
                  Manage Site
                </Link>
              )}
            </>
          )}
        </Box>

        {/* Mobile Hamburger */}
        <Box sx={{ display: { xs: "flex", lg: "none" } }}>
          <IconButton color="inherit" onClick={() => setMobileSearchOpen(true)}>
            <Search />
          </IconButton>
          <ListItem
            component={Link}
            href="/cart"
            onClick={() => setDrawerOpen(false)}
          >
            <Badge badgeContent={totalItems} color="error" overlap="circular">
              <ShoppingCartIcon />
            </Badge>
          </ListItem>

          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          {user && (
            <Tooltip title="Profile">
              <Avatar
                alt={user.name}
                src={"/default-avatar.png"}
                sx={{ cursor: "pointer" }}
                onClick={handleMenu}
              />
            </Tooltip>
          )}

          {/* Mobile Search Drawer */}
          <Drawer
            anchor="top"
            open={mobileSearchOpen}
            onClose={() => setMobileSearchOpen(false)}
          >
            <Box sx={{ p: 2 }}>
              <Autocomplete
                freeSolo
                options={products}
                getOptionLabel={(option) => option.name || ""}
                onChange={(e, value) => value && handleSelect(value)}
                inputValue={search}
                onInputChange={(e, value) => setSearch(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search products..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                )}
              />
            </Box>
          </Drawer>
        </Box>

        {/* Drawer for mobile menu */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 250, p: 2 }}>
            <List>
              {!user ? (
                <>
                  <ListItem
                    component={Link}
                    href="/orders/guest-orders"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Redeem style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Orders" />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/#categories"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Category style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Categories" />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/products"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ShoppingBag style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Shop" />
                  </ListItem>
                  <Divider />
                  <ListItem
                    component={Link}
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <LogoutIcon style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary=" Login" />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/register"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <AppRegistration style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Sign Up" />
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem
                    component={Link}
                    href="/products"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Store fontSize="small" style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Shop" />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/#categories"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Category style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Categories" />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/orders"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ShoppingBag fontSize="small" style={{ marginRight: 8 }} />{" "}
                    <ListItemText primary="Orders" />
                  </ListItem>

                  <Divider />
                  {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <ListItem
                      component={Link}
                      href="/admin"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <ManageAccounts
                        fontSize="small"
                        style={{ marginRight: 8 }}
                      />{" "}
                      <ListItemText primary="Manage Site" />
                    </ListItem>
                  )}
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
