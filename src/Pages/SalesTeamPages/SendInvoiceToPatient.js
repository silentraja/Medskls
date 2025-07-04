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
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  TablePagination,
  useTheme,
  Snackbar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Search,
  Refresh,
  Description as DescriptionIcon,
  DateRange,
  PictureAsPdf,
} from "@mui/icons-material";
import { patientAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

const STATUS_MAPPINGS = {
  1: { name: "Pending", color: "warning" },
  2: { name: "ReviewedByDoctor", color: "primary" },
  5: { name: "ForwardedToSales", color: "info" },
  6: { name: "ObjectionBySales", color: "error" },
  7: { name: "Completed", color: "success" },
};

const getStatusName = (statusId) => {
  return STATUS_MAPPINGS[statusId]?.name || `Status ${statusId}`;
};

const getStatusColor = (statusId) => {
  return STATUS_MAPPINGS[statusId]?.color || "default";
};

const SendInvoiceToPatient = () => {
  const { user } = useAuth();
  const theme = useTheme();
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await patientAPI.getRoleWiseApplication({
        UserID: user.UserId,
        RoleID: user.RoleId,
      });

      if (response.data.success) {
        // Filter for completed applications with payment_receipt
        const paidInvoices = response.data.data.filter(
          (invoice) => invoice.status_id === 7 && invoice.payment_receipt
        );
        setInvoices(paidInvoices);
      } else {
        throw new Error(response.data.message || "Failed to fetch invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to fetch invoices");
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = "https://portal.medskls.com:441/API";
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const handleDownloadReceipt = (invoice) => {
    try {
      if (!invoice?.payment_receipt) {
        throw new Error("No payment receipt available");
      }

      const receiptUrl = getImageUrl(invoice.payment_receipt);
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.setAttribute("download", "");
      link.target = "_blank";

      // Set filename
      const fileName =
        invoice.payment_receipt.split("/").pop() ||
        `receipt_${invoice.application_id}.${
          invoice.payment_receipt.split(".").pop() || "pdf"
        }`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: "Payment receipt download started",
        severity: "success",
      });
    } catch (err) {
      console.error("Error downloading receipt:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to download receipt",
        severity: "error",
      });
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    const statusName = getStatusName(invoice.status_id).toLowerCase();
    return (
      invoice.application_title?.toLowerCase().includes(searchLower) ||
      invoice.SubmittedDate?.toLowerCase().includes(searchLower) ||
      invoice.FullName?.toLowerCase().includes(searchLower) ||
      statusName.includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredInvoices.length - page * rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      {/* Header Section */}
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
            <DescriptionIcon fontSize="large" />
            Patient Invoices
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage completed patient invoices
          </Typography>
        </Box>
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
              placeholder="Search invoices..."
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
          ) : invoices.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No paid invoices found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Only invoices with payment receipts will appear here
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
                  {filteredInvoices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((invoice) => (
                      <TableRow
                        key={invoice.application_id}
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
                              {invoice.FullName?.charAt(0) || "A"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {invoice.application_title ||
                                  "Untitled Application"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ID: {invoice.application_id} -{" "}
                                {invoice.FullName || "N/A"}
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
                              {invoice.SubmittedDate}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusName(invoice.status_id)}
                            color={getStatusColor(invoice.status_id)}
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                              ...(invoice.status_id === 1 && {
                                borderColor: theme.palette.warning.main,
                                color: theme.palette.warning.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(invoice.status_id === 2 && {
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(invoice.status_id === 5 && {
                                borderColor: theme.palette.info.main,
                                color: theme.palette.info.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(invoice.status_id === 6 && {
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(invoice.status_id === 7 && {
                                borderColor: theme.palette.success.main,
                                color: theme.palette.success.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Download Payment Receipt">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownloadReceipt(invoice)}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SendInvoiceToPatient;
