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
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  Badge,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search,
  Refresh,
  AttachFile,
  Visibility,
  MedicalServices,
  Assignment,
  DateRange,
  CheckCircle,
  Cancel,
  HelpOutline,
} from "@mui/icons-material";
import { useAuth } from "../../Context/AuthContext";
import { patientAPI, submittedAnswersAPI } from "../../Api/api";
import { UploadEmployeeFiles } from "../../Api/api";
import { ImageModal } from "./ImageModal";

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1,
};

const PrescriptionListDoc = () => {
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
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState("approve");
  const [answersDialogOpen, setAnswersDialogOpen] = useState(false);
  const [patientAnswers, setPatientAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [doctorFeedbackDialogOpen, setDoctorFeedbackDialogOpen] =
    useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "ArrowRight") {
          handleNext();
        } else if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "Escape") {
          setSelectedImage(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, currentImageIndex, images]);

  const handleViewDoctorFeedback = (app) => {
    setSelectedApp(app);
    setDoctorFeedbackDialogOpen(true);
  };

  // Replace your current setSelectedImage calls with this function
  const handleImageClick = (imageUrl, index) => {
    setCurrentImageIndex(index);
    setSelectedImage(imageUrl);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setSelectedImage(images[currentImageIndex + 1]?.url || images[0]?.url);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setSelectedImage(
      images[currentImageIndex - 1]?.url || images[images.length - 1]?.url
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.error("No image path provided");
      return "";
    }

    // Handle cases where imagePath might already be a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // The API returns paths like "/Assets/PatientImages/..."
    // The correct base URL is "https://portal.medskls.com"
    const baseUrl = "https://portal.medskls.com:441/API";

    // Combine them, ensuring no double slashes
    const fullUrl = `${baseUrl}${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;

    return fullUrl;
  };

  const DOCTOR_STATUS = {
    APPROVE: 2,
    REJECT: 4,
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

  const fetchPatientAnswers = async (applicationId) => {
    try {
      setAnswersLoading(true);

      const response = await submittedAnswersAPI.getByApplicationId(
        applicationId
      );

      if (response.data.success) {
        setPatientAnswers(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch patient answers"
        );
      }
    } catch (err) {
      console.error("Error fetching patient answers:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch patient answers",
        severity: "error",
      });
    } finally {
      setAnswersLoading(false);
    }
  };

  const handleViewAnswers = async (app) => {
    console.log("Application data being viewed:", app);
    setPatientAnswers([]);
    setSelectedApp(app);
    setImagesLoading(true);

    try {
      await fetchPatientAnswers(app.application_id);
      setAnswersDialogOpen(true);
    } catch (error) {
      console.error("Error loading patient data:", error);
      setImagesLoading(false);
      setSnackbar({
        open: true,
        message: "Failed to load patient images",
        severity: "error",
      });
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
        const imageData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "DoctorPrescriptions",
          AssignmentTitle: `Prescription_${selectedApp?.application_id}`,
          Path: "Assets/DoctorPrescriptions/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
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

      setLoading(true);

      const statusId =
        actionType === "approve" ? DOCTOR_STATUS.APPROVE : DOCTOR_STATUS.REJECT;

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
        const updatedApplications = applications.map((app) =>
          app.application_id === selectedApp.application_id
            ? response.data.data[0]
            : app
        );
        setApplications(updatedApplications);
      } else {
        throw new Error(
          response.data.message || "Failed to update application"
        );
      }
    } catch (err) {
      await fetchApplications();

      setSnackbar({
        open: true,
        message: "Application status updated successfully",
        severity: "success",
      });

      setLoading(false);
      setDialogOpen(false);
      setSelectedApp(null);
      setFeedback("");
      setFile(null);
      setFileName("");
      setFilePath(null);
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

  const STATUS_MAPPINGS = {
    1: { name: "Pending", color: "warning" },
    2: { name: "ReviewedByDoctor", color: "primary" },
    5: { name: "ForwardedToSales", color: "info" },
    6: { name: "RejectedBySales", color: "error" },
    7: { name: "Completed", color: "success" },
  };

  const getStatusColor = (statusId) => {
    return STATUS_MAPPINGS[statusId]?.color || "default";
  };

  const getStatusName = (statusId) => {
    const status = statusOptions.find((s) => s.StatusID === statusId);
    return status ? status.StatusName : `Status ${statusId}`;
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
      fetchStatusOptions();
    }
  }, [user?.UserId, user?.RoleId]);

  const filteredApplications = applications.filter((app) => {
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

  const groupedAnswers = patientAnswers.reduce((acc, answer) => {
    if (!acc[answer.QuestionId]) {
      acc[answer.QuestionId] = {
        questionText: answer.QuestionText,
        questionType: answer.QuestionType,
        responses: [],
      };
    }
    acc[answer.QuestionId].responses.push(answer);
    return acc;
  }, {});

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
              color: theme.palette.primary.MainTextColor,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <MedicalServices fontSize="large" />
            Prescription Review
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review and approve patient medication requests
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
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 0.5 }, // Adjusts icon spacing
            },
          }}
        >
          <span style={{ display: { xs: "none", sm: "inline" } }}>Refresh</span>
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
              <HelpOutline
                sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No applications requiring review
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All patient applications have been processed
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
                            label={getStatusName(app.status_id)}
                            color={getStatusColor(app.status_id)}
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="View patient answers">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewAnswers(app)}
                                sx={{
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <Assignment fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {app.doctor_feedback && (
                              <Tooltip title="View doctor's feedback">
                                <IconButton
                                  onClick={() => handleViewDoctorFeedback(app)}
                                  sx={{
                                    color: theme.palette.info.main,
                                    backgroundColor: "action.hover",
                                    "&:hover": {
                                      backgroundColor: theme.palette.info.main,
                                      color: theme.palette.common.white,
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Approve application">
                              <IconButton
                                onClick={() => openActionDialog(app, "approve")}
                                sx={{
                                  color: theme.palette.success.main,
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: theme.palette.success.main,
                                    color: theme.palette.common.white,
                                  },
                                }}
                              >
                                <CheckCircle fontSize="small" />
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
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
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
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              actionType === "approve"
                ? theme.palette.success.main
                : theme.palette.error.main,
            color: theme.palette.getContrastText(
              actionType === "approve"
                ? theme.palette.info.main
                : theme.palette.info.main
            ),
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {actionType === "approve" ? (
            <CheckCircle fontSize="large" />
          ) : (
            <Cancel fontSize="large" />
          )}
          {actionType === "approve"
            ? "Approve Prescription"
            : "Reject Application"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ m: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>
                  <strong>
                    ID: {selectedApp?.application_id} -{" "}
                    {selectedApp?.FullName || "N/A"}
                  </strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Title:</strong> {selectedApp?.application_title}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Submitted:</strong>{" "}
                  {selectedApp?.SubmittedDate &&
                    new Date(selectedApp.SubmittedDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Current Status:</strong>
                  <Chip
                    label={getStatusName(selectedApp?.status_id)}
                    color={getStatusColor(selectedApp?.status_id)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label={
              actionType === "approve"
                ? "Prescription Notes"
                : "Rejection Reason"
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
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />

          <Box
            sx={{
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              p: 2,
              backgroundColor: theme.palette.background.default,
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
                Upload {actionType === "approve" ? "Prescription" : "Document"}
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
              {actionType === "approve"
                ? "Upload the signed prescription document (PDF or image)"
                : "Optional: Upload any supporting documents for rejection"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined" 
            color = {theme.palette.primary.main} 
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
            disabled={loading || !feedback}
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
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Answers Dialog */}
      <Dialog
        open={answersDialogOpen}
        onClose={() => {
          setAnswersDialogOpen(false);
          setPatientAnswers([]);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Assignment />
          Patient Questionnaire Answers
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

          {answersLoading ? (
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
          ) : patientAnswers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No answers found for this application
            </Alert>
          ) : (
            <List
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                p: 0,
              }}
            >
              {Object.entries(groupedAnswers).map(
                ([questionId, questionData]) => {
                  if (questionId === "13") {
                    const frontImage = questionData.responses.find(
                      (r) => r.OptionId === 39
                    )?.front_imagepath;
                    const leftImage = questionData.responses.find(
                      (r) => r.OptionId === 40
                    )?.left_imagepath;
                    const rightImage = questionData.responses.find(
                      (r) => r.OptionId === 41
                    )?.right_imagepath;

                    console.log("Raw image paths from API:", {
                      // Debug log
                      frontImage,
                      leftImage,
                      rightImage,
                    });

                    const imageArray = [
                      { url: getImageUrl(frontImage), label: "Front View" },
                      { url: getImageUrl(leftImage), label: "Left Side View" },
                      {
                        url: getImageUrl(rightImage),
                        label: "Right Side View",
                      },
                    ].filter((img) => img.url);

                    // Only set images if we have some
                    if (
                      imageArray.length > 0 &&
                      JSON.stringify(imageArray) !== JSON.stringify(images)
                    ) {
                      setImages(imageArray);
                    }

                    return (
                      <React.Fragment key={questionId}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {questionData.questionText}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  Patient submitted facial photos:
                                </Typography>
                                <Grid container spacing={2}>
                                  {frontImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                          cursor: "pointer",
                                          transition: "transform 0.2s",
                                          "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: 2,
                                          },
                                        }}
                                        onClick={() => {
                                          // Find the index of the front image in the images array
                                          const frontIndex = images.findIndex(
                                            (img) => img.label === "Front View"
                                          );
                                          handleImageClick(
                                            getImageUrl(frontImage),
                                            frontIndex
                                          );
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                            sx={{ fontWeight: 600 }}
                                          >
                                            Front View
                                          </Typography>
                                          <img
                                            src={getImageUrl(frontImage)}
                                            alt="Front View"
                                            style={{
                                              width: "100%",
                                              height: "200px",
                                              borderRadius: 1,
                                              objectFit: "cover",
                                              backgroundColor:
                                                theme.palette.grey[100],
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                "/placeholder-image.jpg"; // Fallback image
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}

                                  {leftImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                          cursor: "pointer",
                                          transition: "transform 0.2s",
                                          "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: 2,
                                          },
                                        }}
                                        onClick={() => {
                                          // Find the index of the left image in the images array
                                          const leftIndex = images.findIndex(
                                            (img) =>
                                              img.label === "Left Side View"
                                          );
                                          handleImageClick(
                                            getImageUrl(leftImage),
                                            leftIndex
                                          );
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                            sx={{ fontWeight: 600 }}
                                          >
                                            Left Side View
                                          </Typography>
                                          <img
                                            src={getImageUrl(leftImage)}
                                            alt="Left Side View"
                                            style={{
                                              width: "100%",
                                              height: "200px",
                                              borderRadius: 1,
                                              objectFit: "cover",
                                              backgroundColor:
                                                theme.palette.grey[100],
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                "/placeholder-image.jpg"; // Fallback image
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}

                                  {rightImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                          cursor: "pointer",
                                          transition: "transform 0.2s",
                                          "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: 2,
                                          },
                                        }}
                                        onClick={() => {
                                          // Find the index of the right image in the images array
                                          const rightIndex = images.findIndex(
                                            (img) =>
                                              img.label === "Right Side View"
                                          );
                                          handleImageClick(
                                            getImageUrl(rightImage),
                                            rightIndex
                                          );
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                            sx={{ fontWeight: 600 }}
                                          >
                                            Right Side View
                                          </Typography>
                                          <img
                                            src={getImageUrl(rightImage)}
                                            alt="Right Side View"
                                            style={{
                                              width: "100%",
                                              height: "200px",
                                              borderRadius: 1,
                                              objectFit: "cover",
                                              backgroundColor:
                                                theme.palette.grey[100],
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                "/placeholder-image.jpg"; // Fallback image
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  }

                  // Regular question handling
                  return (
                    <React.Fragment key={questionId}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {questionData.questionText}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {questionData.questionType === "multiple_choice"
                                  ? "Selected options:"
                                  : "Selected option:"}
                              </Typography>
                              <Box
                                component="ul"
                                sx={{
                                  pl: 2,
                                  mt: 0.5,
                                  mb: 0,
                                  "& li": {
                                    py: 0.5,
                                  },
                                }}
                              >
                                {questionData.responses.map((response, idx) => (
                                  <li key={idx}>
                                    <Typography variant="body2">
                                      {response.OptionText}
                                      {response.TextResponse &&
                                        !response.TextResponse.startsWith(
                                          "{"
                                        ) &&
                                        ` - ${response.TextResponse}`}
                                    </Typography>
                                  </li>
                                ))}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                }
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setAnswersDialogOpen(false)}
            variant="outlined"
            color= {theme.palette.primary.main}
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

      {/* Doctor Feedback Dialog */}
      <Dialog
        open={doctorFeedbackDialogOpen}
        onClose={() => setDoctorFeedbackDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.info.main,
            color: theme.palette.common.white,
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <MedicalServices />
          Doctor's Feedback
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

          <Card
            elevation={0}
            sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Doctor's Notes
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedApp?.doctor_feedback || "No feedback provided"}
              </Typography>
            </CardContent>
          </Card>

          {selectedApp?.doctor_prescription && (
            <Card
              elevation={0}
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prescription Document
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AttachFile />}
                  onClick={() =>
                    window.open(
                      getImageUrl(selectedApp.doctor_prescription),
                      "_blank"
                    )
                  }
                >
                  View Prescription
                </Button>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDoctorFeedbackDialogOpen(false)}
            variant="outlined"
            color= {theme.palette.primary.main}
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "center",
          }}
          iconMapping={{
            success: <CheckCircle fontSize="large" />,
            error: <Cancel fontSize="large" />,
            warning: <HelpOutline fontSize="large" />,
            info: <HelpOutline fontSize="large" />,
          }}
        >
          <Typography fontWeight={500}>{snackbar.message}</Typography>
        </Alert>
      </Snackbar>

      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={currentImageIndex < images.length - 1}
        hasPrev={currentImageIndex > 0}
        currentIndex={currentImageIndex}
        totalImages={images.length}
        loading={imagesLoading}
      />
    </Box>
  );
};

export default PrescriptionListDoc;
