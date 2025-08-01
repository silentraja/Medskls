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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  Refresh,
  FilterList,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CheckCircleOutline,
  CancelOutlined,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import { userAPI } from "../../Api/api";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: "hidden",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  border: `1px solid ${
    status === 1 ? theme.palette.success.main : theme.palette.error.main
  }`,
  backgroundColor: "transparent",
  color: status === 1 ? theme.palette.success.main : theme.palette.error.main,
  "& .MuiChip-icon": {
    color: status === 1 ? theme.palette.success.main : theme.palette.error.main,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  marginLeft: theme.spacing(1),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  px: 3,
  py: 1,
  fontWeight: 600,
  boxShadow: theme.shadows[1],
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

// Role colors configuration

const UserLogin = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const roleColors = {
    1: { bg: "#e3f2fd", text: "#1565c0" }, // User - blue
    2: { bg: "#fce4ec", text: "#ad1457" }, // Admin - pink
    18: { bg: "#e8f5e9", text: "#2e7d32" }, // Inventory Manager - green
    19: { bg: "#fff3e0", text: "#e65100" }, // Physician - orange
    20: { bg: "#f3e5f5", text: "#7b1fa2" }, // Nurse - purple
    21: { bg: "#e0f7fa", text: "#00838f" }, // Lab Tech - cyan
    22: { bg: "#fff8e1", text: "#ff8f00" }, // Front Desk - amber
    23: { bg: "#f1f8e9", text: "#558b2f" }, // Billing - light green
    24: { bg: "#e8eaf6", text: "#3949ab" }, // Pharmacist - indigo
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.getUserList(-1); // Use -1 to get all users

      if (response.data.success) {
        // Format the user data with FullName
        const formattedUsers = response.data.data.map((user) => ({
          ...user,
          FullName:
            `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "N/A",
        }));
        setUsers(formattedUsers);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      const statusId = newStatus ? 1 : 0;

      // Call the API to update the status
      const response = await userAPI.updateUserStatus(userId, statusId);

      if (response.data.success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.UserId === userId ? { ...user, AccountStatus: statusId } : user
          )
        );

        setSnackbar({
          open: true,
          message: "User status updated successfully",
          severity: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(
        err.message || "Failed to update user status. Please try again."
      );
      setSnackbar({
        open: true,
        message: err.message || "Failed to update user status",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setCurrentUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.Username?.toLowerCase().includes(searchLower) ||
      user.Email?.toLowerCase().includes(searchLower) ||
      user.FullName?.toLowerCase().includes(searchLower) ||
      user.RoleName?.toLowerCase().includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredUsers.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
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
            color: theme.palette.primary.MainTextColor,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          User Management
        </Typography>
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{
            "& .MuiButton-startIcon": {
              marginRight: { xs: 0, sm: 1 }, // Adjust icon spacing for different screens
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Add User
          </Box>
        </PrimaryButton>
      </Box>

      {/* Main User Table */}
      <StyledPaper>
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.MainTextColor,
              }}
            >
              User Accounts
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={fetchUsers}
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

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <Search
                  sx={{
                    color: "action.active",
                    mr: 1,
                  }}
                />
              ),
              sx: {
                borderRadius: 1,
                backgroundColor: theme.palette.background.paper,
              },
            }}
            sx={{
              mb: 2,
              maxWidth: 500,
              width: "35%",
            }}
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 6,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CircularProgress size={50} />
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
        ) : (
          <>
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
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow
                        key={user.UserId}
                        hover
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 40,
                                height: 40,
                              }}
                            >
                              {user.Username?.charAt(0) || "U"}
                            </Avatar>
                            <Box display="flex" flexDirection="column">
                              <Typography
                                variant="body1"
                                fontWeight={500}
                                fontSize="1rem"
                              >
                                {user.Username}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {user.UserId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {user.Email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.RoleName}
                            sx={{
                              backgroundColor:
                                roleColors[user.RoleID]?.bg || "#c7e4fb",
                              color:
                                roleColors[user.RoleID]?.text || "primary.main",
                              fontWeight: 600,
                              minWidth: 100,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            status={user.AccountStatus}
                            label={
                              user.AccountStatus === 1 ? "Active" : "Inactive"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              alignItems: "center", // Added for better vertical alignment
                            }}
                          >
                            <Tooltip title="Edit User">
                              <IconButton
                                onClick={() => handleEditClick(user)}
                                size="small"
                                sx={{
                                  width: 32, // Fixed width
                                  height: 32, // Fixed height to match width
                                  backgroundColor: "action.hover",
                                  color: "primary.main",
                                  borderRadius: "50%", // Ensures perfect circle
                                  "&:hover": {
                                    backgroundColor: "primary.main",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />{" "}
                                {/* Use inherit to respect parent sizing */}
                              </IconButton>
                            </Tooltip>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={user.AccountStatus}
                                onChange={(e) =>
                                  handleStatusChange(
                                    user.UserId,
                                    e.target.value === 1
                                  )
                                }
                                sx={{
                                  borderRadius: 1,
                                  "& .MuiSelect-select": {
                                    py: 0.5,
                                  },
                                }}
                                disabled={loading}
                              >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={0}>Inactive</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                "& .MuiTablePagination-toolbar": {
                  px: 2,
                },
              }}
            />
          </>
        )}
      </StyledPaper>

      {/* Edit User Dialog */}
      {currentUser && (
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "primary.main",
              color: "common.white",
              fontWeight: 600,
              py: 2,
            }}
          >
            Edit User
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  mt: 1,
                  width: 54,
                  height: 54,
                  bgcolor: "primary.main",
                  fontSize: "1.5rem",
                }}
              >
                {currentUser.FullName?.charAt(0) || "U"}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {currentUser.FullName}
              </Typography>
            </Box>

            <TextField
              margin="normal"
              label="Username"
              value={currentUser.Username}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              label="Email"
              value={currentUser.Email}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select value={currentUser.RoleID} label="Role" disabled>
                <MenuItem value={currentUser.RoleID}>
                  {currentUser.RoleName}
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCloseDialog}
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
              onClick={handleCloseDialog}
              color="primary"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}

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

export default UserLogin;
