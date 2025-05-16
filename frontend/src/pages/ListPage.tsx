import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
} from "@mui/material";
import api from "../api";

interface Study {
  id: number;
  dicom_file: string;
  uploaded_at: string;
}

const ListPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    api.get<Study[]>("/studies/").then((res) => setStudies(res.data));
  }, []);

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Studies
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studies.map((study) => (
              <TableRow key={study.id}>
                <TableCell>{study.id}</TableCell>
                <TableCell>
                  {new Date(study.uploaded_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleDownload(study.dicom_file)}
                  >
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default ListPage;
