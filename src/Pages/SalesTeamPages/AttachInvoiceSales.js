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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  useTheme,
  Grid,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Refresh,
  AttachFile,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Close,
  HelpOutline,
  DateRange,
  Visibility,
} from "@mui/icons-material";
import { useAuth } from "../../Context/AuthContext";
import { patientAPI } from "../../Api/api";
import { UploadEmployeeFiles } from "../../Api/api";

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1,
};

const AttachInvoiceSale = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState("approve");
  const [viewFeedbackOpen, setViewFeedbackOpen] = useState(false);

  const SALES_STATUS = {
    APPROVE: 7,
    REJECT: 6,
  };

  const STATUS_MAPPINGS = {
    1: { name: "Pending", color: "warning" },
    2: { name: "ReviewedByDoctor", color: "primary" },
    5: { name: "ForwardedToSales", color: "info" },
    6: { name: "ObjectionBySales", color: "error" },
    7: { name: "Completed", color: "success" },
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = "https://portal.medskls.com:441/API";
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const getStatusName = (statusId) => {
    return STATUS_MAPPINGS[statusId]?.name || `Status ${statusId}`;
  };

  const getStatusColor = (statusId) => {
    return STATUS_MAPPINGS[statusId]?.color || "default";
  };

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
        setApplications(response.data.data);
      } else if (response.data.statusCode === "8004") {
        setApplications([]);
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

  const fetchStatusOptions = async () => {
    try {
      const response = await patientAPI.getDDLStatus();
      if (response.data.success) {
        setStatusOptions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching status options:", err);
      setSnackbar({
        open: true,
        message: "Failed to load status options",
        severity: "error",
      });
    }
  };

  const handleFileUpload = async (file) => {
    try {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result.split(",")[1];
        const fileData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "SalesDocuments",
          AssignmentTitle: `Document_${selectedApp?.application_id}`,
          Path: "Assets/SalesDocuments/",
          Assignments: JSON.stringify([fileData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
          setSnackbar({
            open: true,
            message: "File uploaded successfully!",
            severity: "success",
          });
        } else {
          throw new Error(response.message || "Failed to upload file");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading file:", err);
      setSnackbar({
        open: true,
        message: "Failed to upload file. Please try again.",
        severity: "error",
      });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedApp) {
        throw new Error("No application selected");
      }

      if (actionType === "reject" && !feedback) {
        throw new Error("Rejection reason is required");
      }

      if (actionType === "approve" && !filePath) {
        throw new Error("Document file is required for completion");
      }

      setLoading(true);

      const statusId =
        actionType === "approve" ? SALES_STATUS.APPROVE : SALES_STATUS.REJECT;

      const params = {
        ID: selectedApp.application_id,
        StatusID: statusId,
        RoleID: user.RoleId,
        Description: feedback,
        ImagePath: filePath,
      };

      const response = await patientAPI.updateUserApplication(params);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Application status updated successfully",
          severity: "success",
        });
        fetchApplications();
      } else {
        throw new Error(
          response.data.message || "Failed to update application"
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update application status",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedApp(null);
      setFeedback("");
      setFile(null);
      setFileName("");
      setFilePath(null);
    }
  };

  const openActionDialog = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await handleFileUpload(selectedFile);
    }
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
      fetchStatusOptions();
    }
  }, [user?.UserId, user?.RoleId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const filteredApplications = applications
    .filter((app) => app.status_id === 5)
    .filter((app) => {
      const searchLower = searchTerm.toLowerCase();
      const statusName = getStatusName(app.status_id).toLowerCase();
      return (
        app.application_title?.toLowerCase().includes(searchLower) ||
        app.SubmittedDate?.toLowerCase().includes(searchLower) ||
        statusName.includes(searchLower)
      );
    });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Updated Header Section */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
          <Typography
            variant={isSmallScreen ? "h6" : "h4"}
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.MainTextColor,
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
            Sales Applications
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
              "& .MuiButton-startIcon": {
                mr: { xs: 0, sm: 1 },
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Refresh
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Search Section */}
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
            p: { xs: 1, sm: 2 },
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
              maxWidth: { xs: "100%", sm: 400 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Main Content */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
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
              <HelpOutline
                sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No applications forwarded to sales
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All applications are either pending or processed
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: "primary.light",
                    "& .MuiTableCell-root": {
                      color: "common.white",
                      fontWeight: 600,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
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
                            backgroundColor: "action.hover",
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
                                {app.application_title ||
                                  "Untitled Application"}
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
                            label={getStatusName(app.status_id)}
                            color={getStatusColor(app.status_id)}
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                              borderColor: theme.palette[getStatusColor(app.status_id)]?.main,
                              color: theme.palette[getStatusColor(app.status_id)]?.main,
                              backgroundColor: "common.white",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="View feedbacks">
                              <IconButton
                                onClick={() => {
                                  setSelectedApp(app);
                                  setViewFeedbackOpen(true);
                                }}
                                sx={{
                                  color: "info.main",
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: "info.main",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Complete application">
                              <IconButton
                                onClick={() => openActionDialog(app, "approve")}
                                sx={{
                                  color: "success.main",
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: "success.main",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject application">
                              <IconButton
                                onClick={() => openActionDialog(app, "reject")}
                                sx={{
                                  color: "error.main",
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: "error.main",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 73 * emptyRows }}>
                      <TableCell colSpan={4} />
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

      {/* Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              actionType === "approve" ? "success.main" : "error.main",
            color: "common.white",
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {actionType === "approve" ? (
            <CheckCircleIcon fontSize="large" />
          ) : (
            <CancelIcon fontSize="large" />
          )}
          {actionType === "approve"
            ? "Complete Application"
            : "Reject Application"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ m: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>
                    ID: {selectedApp?.application_id} -{" "}
                    {selectedApp?.FullName || "N/A"}
                  </strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Title:</strong> {selectedApp?.application_title}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Submitted:</strong> {selectedApp?.SubmittedDate}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Current Status:</strong>
                  <Chip
                    label={getStatusName(selectedApp?.status_id)}
                    color={getStatusColor(selectedApp?.status_id)}
                    size="small"
                    sx={{
                      ml: 1,
                      borderColor: theme.palette[getStatusColor(selectedApp?.status_id)]?.main,
                      color: theme.palette[getStatusColor(selectedApp?.status_id)]?.main,
                      backgroundColor: "common.white",
                    }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label={
              actionType === "approve" ? "Completion Notes" : "Rejection Reason"
            }
            name="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            multiline
            rows={4}
            required={actionType === "reject"}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />

          {actionType === "approve" && (
            <Box
              sx={{
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                backgroundColor: "background.default",
              }}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept=".pdf,.jpg,.png,.jpeg"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    mr: 2,
                  }}
                >
                  Upload Documents
                </Button>
              </label>
              {fileName && (
                <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                  <strong>Selected:</strong> {fileName}
                  {filePath && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="success.main"
                      sx={{ mt: 0.5 }}
                    >
                      File uploaded successfully
                    </Typography>
                  )}
                </Typography>
              )}
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Upload the required documents (PDF or image)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
            disabled={loading || (actionType === "reject" && !feedback)}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              minWidth: 120,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : actionType === "approve" ? (
              "Complete"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Feedback Dialog */}
      <Dialog
        open={viewFeedbackOpen}
        onClose={() => setViewFeedbackOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "info.main",
            color: "common.white",
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Visibility fontSize="large" />
          Application Feedbacks
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography my={2}>
              <strong>
                ID: {selectedApp?.application_id} -{" "}
                {selectedApp?.FullName || "N/A"}
              </strong>
            </Typography>
            <Typography variant="subtitle1">
              <strong>Title:</strong> {selectedApp?.application_title}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Doctor's Feedback
            </Typography>
            <Card
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Doctor's Notes
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedApp?.doctor_feedback || "No feedback provided"}
                multiline
                rows={4}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.default",
                  },
                }}
              />
              {selectedApp?.doctor_prescription && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    startIcon={<AttachFile />}
                    onClick={() =>
                      window.open(
                        getImageUrl(selectedApp.doctor_prescription),
                        "_blank"
                      )
                    }
                    sx={{
                      textTransform: "none",
                      color: "info.main",
                    }}
                  >
                    View Prescription
                  </Button>
                </Box>
              )}
            </Card>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Pharmacist's Feedback
            </Typography>
            <Card
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Pharmacist's Notes
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={
                  selectedApp?.pharmacist_feedback || "No feedback provided"
                }
                multiline
                rows={4}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.default",
                  },
                }}
              />
              {selectedApp?.pharmacist_invoice && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    startIcon={<AttachFile />}
                    onClick={() =>
                      window.open(
                        getImageUrl(selectedApp.pharmacist_invoice),
                        "_blank"
                      )
                    }
                    sx={{
                      textTransform: "none",
                      color: "info.main",
                    }}
                  >
                    View Invoice
                  </Button>
                </Box>
              )}
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setViewFeedbackOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
          <Typography fontWeight={500}>{snackbar.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttachInvoiceSale;