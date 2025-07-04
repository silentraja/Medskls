import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  styled,
  Avatar,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Refresh,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { patientAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

// Status color mapping
const statusColors = {
  Pending: { bg: "#fff3e0", text: "#e65100" },
  ReviewedByDoctor: { bg: "#e3f2fd", text: "#1565c0" },
  ApprovedByDoctor: { bg: "#e3f2fd", text: "#1565c0" },
  RejectedByPharmacist: { bg: "#fce4ec", text: "#ad1457" },
  SentToSales: { bg: "#e0f7fa", text: "#00838f" },
  ObjectionBySales: { bg: "#fce4ec", text: "#ad1457" },
  Completed: { bg: "#e8f5e9", text: "#2e7d32" },
};

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  border: `1px solid ${statusColors[status]?.text || theme.palette.divider}`,
  backgroundColor: "transparent",
  color: statusColors[status]?.text || theme.palette.text.primary,
}));

const timeFilters = [
  { value: "2", label: "Last 2 days" },
  { value: "7", label: "Last 7 days" },
  { value: "15", label: "Last 15 days" },
  { value: "30", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];

// Format: MM-DD-YYYY (for display)
const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
};

// Format: YYYY-MM-DD (for API)
const formatDateForAPI = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return {
    from: startDate.toISOString().split("T")[0],
    to: endDate.toISOString().split("T")[0],
  };
};

const ApplicationReport = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("7");
  const [dateRange, setDateRange] = useState(getDateRange(7));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchApplications = async (from, to) => {
    try {
      if (!user?.UserId) throw new Error("User ID not available");

      setLoading(true);
      setError(null);

      const response = await patientAPI.getDateWisePatientApplication({
        DateFrom: from,
        DateTo: to,
      });

      if (response.data.success) {
        setApplications(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch applications"
        );
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.UserId) {
      const range = getDateRange(7);
      setDateRange(range);
      fetchApplications(range.from, range.to);
    }
  }, [user?.UserId]);

  const handleTimeFilterChange = (e) => {
    const value = e.target.value;
    setTimeFilter(value);
    setShowDatePicker(value === "custom");

    if (value !== "custom") {
      const days = parseInt(value);
      const range = getDateRange(days);
      setDateRange(range);
      fetchApplications(range.from, range.to);
    }
  };

  const handleCustomDateFilter = () => {
    if (dateRange.from && dateRange.to) {
      fetchApplications(dateRange.from, dateRange.to);
    }
  };

  const exportFilteredToExcel = () => {
    if (!filteredApplications.length) return;

    const exportData = filteredApplications.map((app) => ({
      "Patient Name": app.PatientName,
      "Application Date": app.ApplicationDate,
      Status: app.Status,
      "Doctor Feedback": app.DoctorFeedback,
      "Pharmacist Feedback": app.PharmacistFeedback,
      "Sales Feedback": app.SaleFeedback,
      "Invoice Date": app.InvoiceDate,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Applications");
    XLSX.writeFile(
      wb,
      `patient_applications_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredApplications = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    return (
      app.PatientName?.toLowerCase().includes(search) ||
      app.ApplicationDate?.toLowerCase().includes(search) ||
      app.Status?.toLowerCase().includes(search)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (a) => a.Status === "Pending"
  ).length;
  const completedApplications = applications.filter(
    (a) => a.Status === "Completed"
  ).length;
  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AssessmentIcon fontSize="large" />
              Applications Analytics
            </Typography>
          </Box>

          <Divider sx={{ my: 0 }} />

          {/* Statistics Card - Top Section */}
          <Box
            sx={{
              p: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Applications
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={600}>
                    {totalApplications}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Pending Applications
                  </Typography>
                  <Typography
                    variant="h3"
                    color="warning.main"
                    fontWeight={600}
                  >
                    {pendingApplications}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Completed Applications
                  </Typography>
                  <Typography
                    variant="h3"
                    color="success.main"
                    fontWeight={600}
                  >
                    {completedApplications}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Main Applications Table */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ color: "primary.main" }}
            >
              Application List
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Export Applications to Excel">
                <IconButton
                  onClick={exportFilteredToExcel}
                  disabled={applications.length === 0}
                  sx={{
                    backgroundColor: "success.main",
                    color: "common.white",
                    "&:hover": {
                      backgroundColor: "success.dark",
                    },
                    borderRadius: 1.5,
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={() => fetchApplications(dateRange.from, dateRange.to)}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                variant="outlined"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  flexGrow: 1,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Time Filter</InputLabel>
                <Select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  label="Time Filter"
                  sx={{ borderRadius: 2 }}
                >
                  {timeFilters.map((filter) => (
                    <MenuItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {showDatePicker && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 3,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="From Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      from: e.target.value, // ✅ keep raw ISO string
                    })
                  }
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="To Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      to: e.target.value, // ✅ keep raw ISO string
                    })
                  }
                  sx={{ borderRadius: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleCustomDateFilter}
                  disabled={!dateRange.from || !dateRange.to}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Apply
                </Button>
              </Box>
            )}

            {loading && applications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 4,
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <CircularProgress size={50} />
                <Typography variant="h6" sx={{ ml: 3 }}>
                  Loading application data...
                </Typography>
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6">{error}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 3,
                  }}
                  onClick={() =>
                    fetchApplications(dateRange.from, dateRange.to)
                  }
                >
                  Retry
                </Button>
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "primary.light",
                      "& .MuiTableCell-root": {
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      },
                    }}
                  >
                    <TableRow>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>Application Date</TableCell>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((app, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {app.PatientName?.charAt(0) || "P"}
                                </Avatar>
                                <Typography variant="body1">
                                  {app.PatientName}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <DateRangeIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {app.ApplicationDate}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              {app.InvoiceDate ? (
                                <Typography variant="body2">
                                  {app.InvoiceDate}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.disabled"
                                >
                                  N/A
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              <StatusChip
                                status={app.Status.replace(/\s+/g, "")} // Remove spaces for status lookup
                                label={app.Status}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" color="text.secondary">
                            No applications found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {emptyRows > 0 && filteredApplications.length > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={7} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredApplications.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                />
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationReport;
