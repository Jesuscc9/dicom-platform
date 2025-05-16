import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import api from "../api";

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("dicom_file", file);
    try {
      await api.post("/studies/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Upload successful");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload DICOM
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Button variant="outlined" component="label">
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography>Selected: {file.name}</Typography>}
          <Button variant="contained" type="submit" disabled={!file}>
            Upload
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UploadPage;
