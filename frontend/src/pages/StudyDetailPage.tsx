// src/pages/StudyDetailPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CircularProgress,
  Paper,
} from "@mui/material";
import api from "../api";

// Cornerstone imports
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Configure Cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
  beforeSend: (xhr) => {
    const token = localStorage.getItem("access");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
  },
});
cornerstoneWADOImageLoader.webWorkerManager.initialize({
  webWorkerPath: "/cornerstoneWADOImageLoaderWebWorker.min.js",
  taskConfiguration: {
    decodeTask: { initializeCodecsOnStartup: true },
  },
});

interface StudyDetail {
  id: number;
  dicom_file: string;
  metadata: Record<string, any>;
  uploaded_at: string;
}

export default function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const { data } = await api.get<StudyDetail>(`/studies/${id}/`);
        setStudy(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudy();
  }, [id]);

  useEffect(() => {
    if (study && viewerRef.current) {
      const element = viewerRef.current;
      cornerstone.enable(element);
      const imageId = `wadouri:${study.dicom_file}`;
      cornerstone.loadAndCacheImage(imageId).then((image) => {
        cornerstone.displayImage(element, image);
      });
      return () => {
        cornerstone.disable(element);
      };
    }
  }, [study]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!study) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Study not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Study #{study.id}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Uploaded at: {new Date(study.uploaded_at).toLocaleString()}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        <Paper elevation={3} sx={{ width: 512, height: 512 }}>
          <div
            ref={viewerRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
          />
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            DICOM Metadata
          </Typography>

          {study.metadata ? (
            <Table size="small">
              <TableBody>
                {Object.entries(study.metadata).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row">
                      {key}
                    </TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No metadata available.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
