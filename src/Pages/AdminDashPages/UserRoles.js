import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { roleAPI } from "../../Api/api";

const UserRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    RoleID: "",
    RoleName: "",
    Description: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleAPI.getRoleList();
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch roles");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching roles");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (role) => {
    setCurrentRole({
      RoleID: role.RoleId,
      RoleName: role.RoleName,
      Description: role.Description,
    });
    setEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setCurrentRole({
      RoleID: "",
      RoleName: "",
      Description: "",
    });
    setAddDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentRole.RoleName.trim()) {
        setSnackbar({
          open: true,
          message: "Role Name is required",
          severity: "error",
        });
        return;
      }

      const roleData = {
        RoleID: currentRole.RoleID || "0",
        RoleName: currentRole.RoleName,
        Description: currentRole.Description,
      };

      const response = await roleAPI.updateRole(roleData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: currentRole.RoleID
            ? "Role updated successfully"
            : "Role created successfully",
          severity: "success",
        });
        fetchRoles();
        setEditDialogOpen(false);
        setAddDialogOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to save role",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "An error occurred while saving the role",
        severity: "error",
      });
    }
  };

  const handleClose = () => {
    setEditDialogOpen(false);
    setAddDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          backgroundColor: "background.paper",
          borderRadius: 2,
          p: 4,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          margin: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {error}
      </Alert>
    );
  }

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "primary.main",
          }}
        >
          <GroupIcon fontSize="large" />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              display: { xs: "none", sm: "block" }, // Hide on extra-small screens
            }}
          >
            User Roles Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Create New Role
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
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
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.RoleId}
                  hover
                  sx={{ "&:last-child td": { borderBottom: 0 } }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 32,
                          height: 32,
                        }}
                      >
                        {role.RoleName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {role.RoleName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Role ID: {role.RoleId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {role.Description || "No description provided"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Role">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditClick(role)}
                        sx={{
                          backgroundColor: "action.hover",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "common.white",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Role Dialog */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
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
          {currentRole.RoleID ? "Edit Role" : "Create New Role"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {currentRole.RoleID && (
            <TextField
              margin="normal"
              label="Role ID"
              name="RoleID"
              value={currentRole.RoleID}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            margin="normal"
            label="Role Name"
            name="RoleName"
            value={currentRole.RoleName}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Description"
            name="Description"
            value={currentRole.Description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
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
            onClick={handleSave}
            color="primary"
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
            }}
          >
            {currentRole.RoleID ? "Update Role" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
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

export default UserRoles;
