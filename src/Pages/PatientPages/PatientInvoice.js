import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  Download,
  PictureAsPdf,
  Receipt,
  Search,
  Refresh,
  Payment,
  Description as DescriptionIcon,
  DateRange,
  CloudUpload,
  Close,
} from "@mui/icons-material";
import { patientAPI, UploadEmployeeFiles } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";
import PaymentPatient from "./PaymentPatient";

const PatientInvoice = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [receiptUploadOpen, setReceiptUploadOpen] = useState(false);

  const fetchInvoices = async () => {
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
        const completedApplications = response.data.data.filter(
          (app) => app.status_id === 7 && app.final_invoice
        );
        setInvoices(completedApplications || []);
      } else if (response.data.statusCode === "8004") {
        setInvoices([]);
      } else {
        throw new Error(response.data.message || "Failed to fetch invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to fetch invoices. Please try again.");
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch invoices",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchInvoices();
    }
  }, [user?.UserId, user?.RoleId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.application_title?.toLowerCase().includes(searchLower) ||
      invoice.SubmittedDate?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredInvoices.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = "https://portal.medskls.com:441/API";
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const handleFileUpload = async (file, invoice) => {
    try {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File size exceeds 5MB limit",
          severity: "error",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target.result.split(",")[1];
          const fileData = {
            Image: `${file.name}|${base64String}`,
            fileName: file.name,
            fileType: file.type,
          };

          const uploadParams = {
            SubjectName: "PatientReceipts",
            AssignmentTitle: `Receipt_${invoice.application_id}`,
            Path: "Assets/PatientReceipts/",
            Assignments: JSON.stringify([fileData]),
          };

          const uploadResponse = await UploadEmployeeFiles(uploadParams);
          if (uploadResponse.error || !uploadResponse.data || !uploadResponse.data.length) {
            throw new Error(uploadResponse.message || "Failed to upload receipt");
          }

          const updateParams = {
            ID: invoice.application_id,
            StatusID: invoice.status_id,
            RoleID: user.RoleId,
            ImagePath: uploadResponse.data[0],
          };

          const updateResponse = await patientAPI.updateUserApplication(updateParams);
          if (updateResponse.error || updateResponse.success === false) {
            throw new Error(updateResponse.message || "Failed to update application");
          }

          setSnackbar({
            open: true,
            message: "Receipt uploaded successfully!",
            severity: "success",
          });

          fetchInvoices();
          handleCloseReceiptUpload();
        } catch (innerError) {
          console.error("Error during file read/upload/update:", innerError);
          setSnackbar({
            open: true,
            message: innerError.message || "An unexpected error occurred during upload.",
            severity: "error",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (outerError) {
      console.error("Outer error during upload:", outerError);
      setSnackbar({
        open: true,
        message: outerError.message || "An error occurred while uploading the receipt.",
        severity: "error",
      });
    }
  };

  const handleDownload = (invoice) => {
    try {
      if (!invoice?.final_invoice) {
        throw new Error("No invoice file available for download");
      }

      const invoiceUrl = getImageUrl(invoice.final_invoice);
      const link = document.createElement("a");
      link.href = invoiceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const fileName = invoice.final_invoice.split("/").pop() || `invoice_${invoice.application_id}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: "Invoice download started",
        severity: "success",
      });
    } catch (err) {
      console.error("Error downloading invoice:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to download invoice",
        severity: "error",
      });
    }
  };

  const handlePayNow = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleUploadReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setReceiptUploadOpen(true);
  };

  const handleCloseReceiptUpload = () => {
    setReceiptUploadOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <Container maxWidth="lg" sx={{ p: isSmallScreen ? 1 : 3 }}>
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
            Patient Invoices
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              display: { xs: "none", sm: "block" },
              ml: 1
            }}
          >
          </Typography>

          {/* Desktop - Full Button */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchInvoices}
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
            onClick={fetchInvoices}
            disabled={loading}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Updated Search Section */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
          mx: { xs: 0, sm: 0 },
          width: { xs: "100vw", sm: "auto" },
          maxWidth: "100%",
          overflowX: "auto",
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
            placeholder="Search invoices..."
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

        {/* Table Content */}
        <TableContainer
          sx={{
            px: { xs: 0.5, sm: 2 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {!user?.UserId ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please log in to view your applications
            </Alert>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : invoices.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No completed applications found
            </Alert>
          ) : (
            <>
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ backgroundColor: "primary.light" }}>
                  <TableRow>
                    <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
                      Application
                    </TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
                      Submitted
                    </TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: 600 }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ color: "common.white", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((invoice) => (
                      <TableRow key={invoice.application_id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                width: 40,
                                height: 40,
                                fontSize: "1rem",
                              }}
                            >
                              {invoice.FullName?.charAt(0) || "P"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {invoice.application_title || "Untitled Application"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {invoice.application_id} - {invoice.FullName || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <DateRange color="action" fontSize="small" />
                            <Typography variant="body2">
                              {invoice.SubmittedDate}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color="success"
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                              borderColor: theme.palette.success.main,
                              color: theme.palette.success.main,
                              backgroundColor: theme.palette.common.white,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Download Invoice PDF">
                              <IconButton
                                color="primary"
                                onClick={() => handleDownload(invoice)}
                                disabled={!invoice.final_invoice}
                              >
                                <PictureAsPdf />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Make Payment">
                              <IconButton
                                color="success"
                                onClick={() => handlePayNow(invoice)}
                              >
                                <Payment />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Upload Payment Receipt">
                              <IconButton
                                color="secondary"
                                onClick={() => handleUploadReceipt(invoice)}
                              >
                                <CloudUpload />
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
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />
            </>
          )}
        </TableContainer>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            py: 2,
            px: 3,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
            }}
          >
            <IconButton
              size="small"
              onClick={handleClosePaymentDialog}
              sx={{ color: "inherit" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Payment
            sx={{
              mr: 2,
              fontSize: 28,
              color: "white",
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Complete Payment
            </Typography>
            {selectedInvoice && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Invoice #{selectedInvoice.application_id}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "background.paper" }}>
          {selectedInvoice && (
            <Box
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Invoice Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Patient
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {`${selectedInvoice?.FullName} - ID: ${selectedInvoice.application_id}`}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          <Box sx={{ p: 3 }}>
            <PaymentPatient
              invoice={selectedInvoice}
              onClose={handleClosePaymentDialog}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog
        open={receiptUploadOpen}
        onClose={handleCloseReceiptUpload}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center">
            <Receipt sx={{ mr: 1 }} />
            {selectedInvoice?.payment_receipt
              ? "Payment Receipt"
              : "Upload Payment Receipt"}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedInvoice && (
            <Box
              sx={{
                backgroundColor: "background.paper",
                p: 2,
                borderRadius: 1,
                borderLeft: "4px solid",
                borderColor: "primary.main",
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Invoice Details:
              </Typography>
              <Typography>
                <strong>ID:</strong> {selectedInvoice.application_id}
              </Typography>
              <Typography>
                <strong>Title:</strong> {selectedInvoice.application_title}
              </Typography>
              <Typography>
                <strong>Upload Date:</strong> {selectedInvoice.SubmittedDate}
              </Typography>
            </Box>
          )}

          {selectedInvoice?.payment_receipt ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 250,
                maxWidth: "500px",
                margin: "0 auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "action.hover",
                "&:hover .receipt-actions": {
                  opacity: 1,
                },
              }}
            >
              {selectedInvoice.payment_receipt.endsWith(".pdf") ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                  }}
                >
                  <PictureAsPdf sx={{ fontSize: 48, color: "error.main" }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    PDF Receipt
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedInvoice.payment_receipt.split("/").pop()}
                  </Typography>
                </Box>
              ) : (
                <img
                  src={getImageUrl(selectedInvoice.payment_receipt)}
                  alt="Payment Receipt"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    e.target.style.display = "none";
                  }}
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              )}

              <Box
                className="receipt-actions"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = getImageUrl(selectedInvoice.payment_receipt);
                    link.target = "_blank";
                    link.download =
                      selectedInvoice.payment_receipt.split("/").pop() ||
                      "receipt";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Download Receipt
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CloudUpload />}
                  onClick={() => {
                    setSelectedInvoice((prev) => ({
                      ...prev,
                      payment_receipt: null,
                    }));
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    ml: 2,
                    backgroundColor: "background.paper",
                  }}
                >
                  Replace Receipt
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                mt: 2,
                mb: 2,
                backgroundColor: "action.hover",
              }}
            >
              <CloudUpload
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Drag and drop receipt file here
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mt: 2 }}
              >
                Select File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      await handleFileUpload(file, selectedInvoice);
                    }
                  }}
                />
              </Button>
            </Box>
          )}
        </DialogContent>
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientInvoice;