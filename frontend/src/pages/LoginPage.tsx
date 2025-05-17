import React, {
  useContext,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import api from "../api";
import { setToken } from "../auth";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";

interface Credentials {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [creds, setCreds] = useState<Credentials>({
    username: "",
    password: "",
  });

  const { auth, login } = useAuth();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreds((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(creds.username, creds.password);
    } catch (err: any) {
      notify(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  console.log(auth);

  if (auth.access) {
    return <Navigate to="/studies" replace />;
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username"
            name="username"
            value={creds.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={creds.password}
            onChange={handleChange}
            required
          />
          <Button variant="contained" type="submit" disabled={loading}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
