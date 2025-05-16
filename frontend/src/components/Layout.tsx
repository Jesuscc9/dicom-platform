// src/components/Layout.tsx
import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { auth, logout } = useAuth();

  return (
    <>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              DICOM Platform
            </Typography>
            {auth.access ? (
              <>
                <Button color="inherit" component={Link} to="/upload">
                  Upload
                </Button>
                <Button color="inherit" component={Link} to="/studies">
                  Studies
                </Button>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
                {auth.user?.role === "doctor" && (
                  <Button component={Link} to="/studies">
                    All Studies
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
      <CssBaseline />
    </>
  );
}
