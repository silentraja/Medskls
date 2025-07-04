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
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Search,
  Refresh,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  DateRange,
} from "@mui/icons-material";
import { patientAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

const AppStatsPatient = () => {
  const { user } = useAuth();
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  const fetchApplications = async () => {
    try {
      if (!user?.UserId) {
        throw new Error("User ID not available");
      }

      setLoading(true);
      setError(null);

      const response = await patientAPI.getRoleWiseApplication({
        RoleID: user.RoleId,
        UserID: user.UserId,
      });

      if (response.data.success) {
        // Format the data to include both ID and FullName
        const formattedData = response.data.data.map((app) => ({
          ...app,
          displayText: `ID: ${app.application_id} - ${app.FullName}`,
        }));
        setApplications(formattedData);
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
    if (user?.UserId) {
      fetchApplications();
    }
  }, [user?.UserId]);

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
      app.displayText?.toLowerCase().includes(searchLower) ||
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

  const getStatusChipStyles = (status, theme) => {
    const statusLower = status?.toLowerCase();
    const baseStyles = {
      fontWeight: 500,
      borderRadius: 1,
      variant: "outlined",
      backgroundColor: theme.palette.common.white,
    };

    switch (statusLower) {
      case "pending":
        return {
          ...baseStyles,
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.main,
        };
      case "approved":
      case "completed":
        return {
          ...baseStyles,
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        };
      case "rejected":
        return {
          ...baseStyles,
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
        };
      case "reviewedbydoctor":
        return {
          ...baseStyles,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
        };
      case "forwardedtosales":
        return {
          ...baseStyles,
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          <Typography
            variant={isSmallScreen ? "h6" : "h4"}
            sx={{
              fontWeight: 700,
              color: "primary.main",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
            }}
          >
            <DescriptionIcon
              fontSize={isSmallScreen ? "medium" : "large"}
              sx={{ mr: 1 }}
            />
            My Patient Applications
          </Typography>

          {/* Desktop - Full Button */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
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

          {/* Mobile - Icon Only */}
          <IconButton
            sx={{
              display: { xs: "flex", sm: "none" },
              color: "common.white",
              backgroundColor: "primary.light",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "common.white",
              },
            }}
            onClick={fetchApplications}
            disabled={loading}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
          mx: { xs: 0, sm: 0 },
          width: { xs: "100vw", sm: "auto" }, // Use viewport width on mobile
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 2 }, // Reduce padding on mobile
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
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
              size: "small",
            }}
            sx={{
              maxWidth: { xs: "100%", sm: 400 }, // Full width on mobile
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>
        {/* Table container adjustments */}
        <TableContainer
          sx={{
            px: { xs: 0.5, sm: 2 }, // Reduce padding on mobile
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Table
            sx={{
              minWidth: 750,
              // Optional: make table horizontally scrollable on mobile
              overflowX: { xs: "auto", sm: "visible" },
            }}
          >
            {/* Table head - adjust font size for mobile */}
            <TableHead sx={{ backgroundColor: "primary.light" }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "inherit" }, // Smaller font on mobile
                  }}
                >
                  Application
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "inherit" },
                  }}
                >
                  Submitted Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "inherit" },
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table body - adjust cell padding for mobile */}
            <TableBody>
              {filteredApplications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((app) => (
                  <TableRow key={app.application_id} hover>
                    <TableCell sx={{ p: { xs: 1, sm: "16px" } }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                          }}
                        >
                          {app.FullName?.charAt(0) || "A"}
                        </Avatar>
                        <Box>
                          <Typography
                            fontWeight={600}
                            fontSize={{ xs: "0.8rem", sm: "inherit" }}
                          >
                            {app.application_title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize={{ xs: "0.7rem", sm: "0.875rem" }}
                          >
                            ID: {app.application_id} - {app.FullName || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, sm: "16px" } }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DateRange color="action" fontSize="small" />
                        <Typography fontSize={{ xs: "0.8rem", sm: "inherit" }}>
                          {app.SubmittedDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ p: { xs: 1, sm: "16px" } }}>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status_id)}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 1,
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          height: { xs: 24, sm: 32 },
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
                paddingLeft: { xs: 1, sm: 2 },
                paddingRight: { xs: 1, sm: 2 },
                flexWrap: { xs: "wrap", sm: "nowrap" },
              },
              "& .MuiTablePagination-spacer": {
                display: { xs: "none", sm: "block" },
              },
            }}
          />
        </TableContainer>
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
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppStatsPatient;
