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
  useMediaQuery,
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await patientAPI.getRoleWiseApplication({
        UserID: user.UserId,
        RoleID: user.RoleId,
      });

      if (response.data.success) {
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
      link.target = "_blank";
      link.download =
        invoice.payment_receipt.split("/").pop() ||
        `receipt_${invoice.application_id}.pdf`;
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
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
      </Paper>

      {/* Main Content */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              p: 4,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              m: 3,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            {error}
          </Alert>
        ) : invoices.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              backgroundColor: "background.default",
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
          <TableContainer>
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
                {filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((invoice) => (
                    <TableRow
                      key={invoice.application_id}
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
                            {invoice.FullName?.charAt(0) || "A"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>
                              {invoice.application_title ||
                                "Untitled Application"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
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
                            borderColor: theme.palette[getStatusColor(invoice.status_id)]?.main,
                            color: theme.palette[getStatusColor(invoice.status_id)]?.main,
                            backgroundColor: "common.white",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Download Payment Receipt">
                          <IconButton
                            color="primary"
                            onClick={() => handleDownloadReceipt(invoice)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: "action.hover",
                              "&:hover": {
                                backgroundColor: "primary.main",
                                color: "common.white",
                              },
                            }}
                          >
                            <PictureAsPdf fontSize="small" />
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SendInvoiceToPatient;