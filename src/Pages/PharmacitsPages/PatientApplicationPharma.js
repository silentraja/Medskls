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
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { Search, Refresh, Add, DateRange } from "@mui/icons-material";
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
  2: "Reviewed by Doctor",
  3: "Approved by Doctor",
  4: "Rejected by Pharmacist",
  5: "Sent to Sales",
  7: "Completed",
};

const PatientApplicationPharma = () => {
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

  // Get role-specific title
  const getRoleTitle = () => {
    switch (user?.RoleId) {
      case ROLES.ADMIN:
        return "All Applications (Admin View)";
      case ROLES.DOCTOR:
        return "Applications Needing Doctor Review";
      case ROLES.PHARMACIST:
        return "Applications Ready for Pharmacy";
      case ROLES.SALES:
        return "Applications Ready for Sales";
      case ROLES.PATIENT:
        return "My Applications";
      default:
        return "Patient Applications";
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Updated Header Section */}
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
        <Box>
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
            {getRoleTitle()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.RoleId === ROLES.ADMIN
              ? "View and manage all patient applications"
              : user?.RoleId === ROLES.PHARMACIST
              ? "Review and process pharmacy applications"
              : "Manage patient applications"}
          </Typography>
        </Box>
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

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
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
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
                size: "small",
              }}
              sx={{
                maxWidth: 400,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                },
              }}
            />
            {user?.RoleId === ROLES.PATIENT && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                New Application
              </Button>
            )}
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : applications.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user?.RoleId === ROLES.ADMIN
                  ? "There are currently no applications in the system"
                  : "There are no applications matching your current role"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    "& .MuiTableCell-root": {
                      color: theme.palette.common.white,
                      fontWeight: 600,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    {user?.RoleId === ROLES.PATIENT && (
                      <TableCell align="center">Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => (
                      <TableRow
                        key={app.application_id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              {app.FullName?.charAt(0) || "A"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {app.application_title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ID: {app.application_id} -{" "}
                                {app.FullName || "N/A"}
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
                        <TableCell>
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
                        {user?.RoleId === ROLES.PATIENT && (
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 500,
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell
                        colSpan={user?.RoleId === ROLES.PATIENT ? 4 : 3}
                      />
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
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

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
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientApplicationPharma;
