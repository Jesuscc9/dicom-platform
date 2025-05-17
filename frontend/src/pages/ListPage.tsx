import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import DatePicker from "@mui/lab/DatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

interface Study {
  id: number;
  thumbnail: string;
  uploaded_at: string;
  metadata: { [key: string]: any };
}

export default function ListPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [patientName, setPatientName] = useState("");
  const [studyDate, setStudyDate] = useState<Date | null>(null);

  const fetchStudies = () => {
    const params: any = {};
    if (patientName) params.patient_name = patientName;
    if (studyDate) params.study_date = studyDate.toISOString().slice(0, 10);
    api.get("/studies/", { params }).then((r) => setStudies(r.data));
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  console.log(studies);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Study Date"
            value={studyDate}
            onChange={(newVal) => setStudyDate(newVal)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={fetchStudies}>
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setPatientName("");
            setStudyDate(null);
            fetchStudies();
          }}
        >
          Clear
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thumbnail</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Study Date</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studies.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <img
                    src={s.thumbnail ?? "hola"}
                    alt="thumb"
                    width={64}
                    height={64}
                  />
                </TableCell>
                <TableCell>{s.metadata?.PatientName}</TableCell>
                <TableCell>{s.metadata?.StudyDate}</TableCell>
                <TableCell>
                  {new Date(s.uploaded_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button component={Link} to={`/studies/${s.id}`}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
