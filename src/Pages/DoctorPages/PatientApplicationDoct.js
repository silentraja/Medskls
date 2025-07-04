import React, { useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Snackbar,
  Button,
  useTheme,
} from "@mui/material";
import {
  Search,
  Refresh,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  LocalHospital as DoctorIcon,
  MedicalServices as PharmacistIcon,
  ShoppingCart as SalesIcon,
  Person as PatientIcon,
  DateRange,
} from "@mui/icons-material";
import { patientAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

// Role constants for better readability
const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1,
};

// Status constants mapping
const STATUS_MAPPING = {
  1: "Pending",
  3: "Approved by Doctor",
  4: "Rejected by Pharmacist",
  5: "Sent to Sales",
};

const PatientApplicationDoc = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get role-specific title and icon
  const getRoleConfig = () => {
    switch (user?.RoleId) {
      case ROLES.ADMIN:
        return {
          title: "All Applications (Admin View)",
          icon: <DescriptionIcon fontSize="large" />,
        };
      case ROLES.DOCTOR:
        return {
          title: "Applications Needing Doctor Review",
          icon: <DoctorIcon fontSize="large" />,
        };
      case ROLES.PHARMACIST:
        return {
          title: "Applications Ready for Pharmacy",
          icon: <PharmacistIcon fontSize="large" />,
        };
      case ROLES.SALES:
        return {
          title: "Applications Ready for Sales",
          icon: <SalesIcon fontSize="large" />,
        };
      case ROLES.PATIENT:
        return {
          title: "My Applications",
          icon: <PatientIcon fontSize="large" />,
        };
      default:
        return {
          title: "Patient Applications",
          icon: <DescriptionIcon fontSize="large" />,
        };
    }
  };

  // Fetch applications based on role
  const fetchApplications = async () => {
    try {
      if (!user?.UserId || !user?.RoleId) {
        throw new Error("User information not available");
      }

      setLoading(true);
      setError(null);

      const response = await patientAPI.getRoleWiseApplication({
        RoleID: user.RoleId,
        UserID: user.UserId,
      });

      if (response.data.success) {
        // Format status text based on status_id
        const formattedData = response.data.data.map((app) => ({
          ...app,
          status: STATUS_MAPPING[app.status_id] || app.status,
        }));
        setApplications(formattedData);
      } else if (response.data.statusCode === "8004") {
        setApplications([]); // No records found is a valid case
      } else {
        throw new Error(
          response.data.message || "Failed to fetch applications"
        );
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err.message || "Failed to fetch applications. Please try again."
      );
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch applications",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
    }
  }, [user?.UserId, user?.RoleId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.application_title?.toLowerCase().includes(searchLower) ||
      app.SubmittedDate?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "warning"; // Pending
      case 2:
        return "primary"; // Reviewed by Doctor
      case 3:
        return "primary"; // Approved by Doctor
      case 4:
        return "error"; // Rejected by Pharmacist
      case 5:
        return "info"; // Sent to Sales
      case 6:
        return "error"; //Rejected By Sales
      case 7:
        return "success"; // Completed
      default:
        return "default";
    }
  };

  const { title, icon } = getRoleConfig();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
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
          {icon}
          {title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={fetchApplications}
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

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "background.default",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
            }}
            sx={{
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>

        {!user?.UserId || !user?.RoleId ? (
          <Alert
            severity="warning"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            Please log in to view applications
          </Alert>
        ) : loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              backgroundColor: "background.paper",
              borderRadius: 2,
              p: 4,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            No applications found matching your role criteria
          </Alert>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead
                sx={{
                  backgroundColor: "primary.light",
                  "& .MuiTableCell-root": {
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Application</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((app) => (
                    <TableRow
                      key={app.application_id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {app.FullName?.charAt(0) || "A"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>
                              {app.application_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {app.application_id} - {app.FullName || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <DateRange color="action" fontSize="small" />
                          <Typography variant="body2">
                            {app.SubmittedDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={app.status}
                          color={getStatusColor(app.status_id)}
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1,
                            // Explicit styling for each status
                            ...(app.status_id === 1 && {
                              // Pending
                              borderColor: theme.palette.warning.main,
                              color: theme.palette.warning.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status_id === 2 && {
                              // Reviewed by Doctor
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status_id === 3 && {
                              // Approved by Doctor
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status_id === 4 && {
                              // Rejected by Pharmacist
                              borderColor: theme.palette.error.main,
                              color: theme.palette.error.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status_id === 5 && {
                              // Sent to Sales
                              borderColor: theme.palette.info.main,
                              color: theme.palette.info.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status_id === 7 && {
                              // Completed
                              borderColor: theme.palette.success.main,
                              color: theme.palette.success.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={3} />
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
              sx={{
                "& .MuiTablePagination-toolbar": {
                  justifyContent: "flex-end",
                },
              }}
            />
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <CancelIcon fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientApplicationDoc;
