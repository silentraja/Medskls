import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { userAPI } from "../../Api/api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const ChangePassword = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [decrypting, setDecrypting] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserList(-1);

        if (response.data?.success) {
          setAllUsers(response.data.data || []);
          const initialVisibility = {};
          response.data.data.forEach((u) => {
            initialVisibility[u.UserId] = false;
          });
          setShowPasswords(initialVisibility);
        } else {
          setGlobalError(response.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setGlobalError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getDecryptedPassword = async (userId, encryptedPassword) => {
    if (decryptedPasswords[userId]) return;

    try {
      setDecrypting((prev) => ({ ...prev, [userId]: true }));
      const response = await userAPI.getDecryptedPassword(encryptedPassword);

      if (response.data?.success) {
        setDecryptedPasswords((prev) => ({
          ...prev,
          [userId]: response.data.data || "Decryption failed",
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          [userId]: response.data?.message || "Failed to decrypt password",
        }));
      }
    } catch (err) {
      console.error("Error decrypting password:", err);
      setFieldErrors((prev) => ({
        ...prev,
        [userId]: err.message || "Failed to decrypt password",
      }));
    } finally {
      setDecrypting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const startEditing = (userId) => {
    setEditingId(userId);
    setEditPassword("");
    setFieldErrors((prev) => ({ ...prev, [userId]: null }));
    setSuccess(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPassword("");
  };

  const handlePasswordChange = (e, userId) => {
    const value = e.target.value;
    setEditPassword(value);

    // Validate immediately
    if (value.length > 0 && value.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        [userId]: "Password must be at least 6 characters",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const savePassword = async (userId) => {
    if (!editPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        [userId]: "Password cannot be empty",
      }));
      return;
    }

    if (editPassword.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        [userId]: "Password must be at least 6 characters",
      }));
      return;
    }

    try {
      setLoading(true);
      setFieldErrors((prev) => ({ ...prev, [userId]: null }));

      const response = await userAPI.updatePassword(userId, editPassword);

      if (
        response.data?.success ||
        response.data?.data?.[0]?.Mesg === "Updated"
      ) {
        // Re-fetch the entire user list to get the updated encrypted hash
        const userListResponse = await userAPI.getUserList(-1);
        if (userListResponse.data?.success) {
          setAllUsers(userListResponse.data.data || []);

          // Also reset password visibility and decrypted state for this user
          setDecryptedPasswords((prev) => ({ ...prev, [userId]: undefined }));
          setShowPasswords((prev) => ({ ...prev, [userId]: false }));
        }

        setEditingId(null);
        setEditPassword("");
        setSuccess(true);
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          [userId]: response.data?.message || "Failed to update password",
        }));
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setFieldErrors((prev) => ({
        ...prev,
        [userId]:
          err.response?.data?.message ||
          err.message ||
          "Failed to update password",
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading && allUsers.length === 0) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ ml: 3 }}>
            Loading user data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (globalError) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="error"
          sx={{
            mt: 3,
            borderRadius: 2,
            boxShadow: 1,
          }}
          icon={<CancelIcon fontSize="inherit" />}
        >
          <Typography variant="h6">{globalError}</Typography>
          <Button
            variant="contained"
            color="error"
            sx={{
              mt: 2,
              borderRadius: 2,
              px: 3,
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (allUsers.length === 0) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="warning"
          sx={{
            mt: 3,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          No user data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              p: 2,
              backgroundColor: "background.paper",
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
              Password Management
            </Typography>
          </Box>

          <Divider sx={{ my: 0 }} />

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 0 }}
          >
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "primary.light",
                  "& .MuiTableCell-root": {
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  },
                }}
              >
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow
                    key={user.UserId}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor: "action.hover",
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
                            {user.FullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.UserId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EmailIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">{user.Email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <Box>
                          <TextField
                            type="password"
                            value={editPassword}
                            onChange={(e) =>
                              handlePasswordChange(e, user.UserId)
                            }
                            size="small"
                            fullWidth
                            placeholder="Enter new password"
                            error={Boolean(fieldErrors[user.UserId])}
                            helperText={fieldErrors[user.UserId]}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <KeyIcon color="action" />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2 },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {showPasswords[user.UserId] ? (
                            <>
                              {decryptedPasswords[user.UserId] ? (
                                <Chip
                                  label={decryptedPasswords[user.UserId]}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    getDecryptedPassword(
                                      user.UserId,
                                      user.PasswordHash
                                    )
                                  }
                                  disabled={decrypting[user.UserId]}
                                  startIcon={
                                    decrypting[user.UserId] ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <KeyIcon fontSize="small" />
                                    )
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                  }}
                                >
                                  {decrypting[user.UserId]
                                    ? "Decrypting"
                                    : "Decrypt"}
                                </Button>
                              )}
                            </>
                          ) : (
                            <Chip
                              label="••••••••"
                              size="small"
                              sx={{
                                backgroundColor: "grey.100",
                                color: "text.secondary",
                              }}
                            />
                          )}
                          <Tooltip
                            title={
                              showPasswords[user.UserId]
                                ? "Hide password"
                                : "Show password"
                            }
                            arrow
                          >
                            <IconButton
                              size="small"
                              onClick={() => {
                                togglePasswordVisibility(user.UserId);
                                if (
                                  !showPasswords[user.UserId] &&
                                  !decryptedPasswords[user.UserId]
                                ) {
                                  getDecryptedPassword(
                                    user.UserId,
                                    user.PasswordHash
                                  );
                                }
                              }}
                              sx={{
                                ml: 1,
                                "&:hover": {
                                  backgroundColor: "primary.light",
                                  color: "common.white",
                                },
                              }}
                            >
                              {showPasswords[user.UserId] ? (
                                <VisibilityOffIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => savePassword(user.UserId)}
                            disabled={loading}
                            startIcon={
                              loading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <SaveIcon />
                              )
                            }
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              px: 2,
                            }}
                          >
                            {loading ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={cancelEditing}
                            disabled={loading}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              px: 2,
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => startEditing(user.UserId)}
                          startIcon={<LockIcon fontSize="small" />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            px: 2,
                          }}
                        >
                          Change
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {success && (
            <Alert
              severity="success"
              sx={{
                m: 3,
                borderRadius: 2,
                boxShadow: 1,
              }}
              icon={<CheckCircleIcon fontSize="inherit" />}
              onClose={() => setSuccess(false)}
            >
              Password updated successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChangePassword;
