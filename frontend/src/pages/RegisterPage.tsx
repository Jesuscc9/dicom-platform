import React, { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { type SelectChangeEvent } from "@mui/material/Select";
import api from "../api";
import { useNavigate } from "react-router-dom";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    role: "patient",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register/", form);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Register
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
            value={form.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <FormControl required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="clinic">Clinic</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" type="submit">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
