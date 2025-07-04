import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
} from "@mui/material";
import { Edit, Save, Cancel, CameraAlt } from "@mui/icons-material";
import { userAPI } from "../../Api/api";

const PersonalProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    UserID: "",
    Username: "",
    FullName: "",
    Email: "",
    DateOfBirth: "",
    Phone: "",
    Gender: "",
    ResidentialAddress: "",
    RoleName: "",
    AccountStatus: 0,
    ProfilePath: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setFormData({
        UserID: user.UserID || "",
        Username: user.Username || "",
        FullName: user.FullName || "",
        Email: user.Email || "",
        DateOfBirth: user.DateOfBirth?.split("T")[0] || "",
        Phone: user.Phone || "",
        Gender: user.Gender || "M",
        ResidentialAddress: user.ResidentialAddress || "",
        RoleName: user.RoleName || "User",
        AccountStatus: user.AccountStatus || 0,
        ProfilePath: user.ProfilePicture || "",
      });

      if (user.ProfilePicture) {
        setPreviewImage(user.ProfilePicture);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setFormData((prev) => ({
        ...prev,
        ProfilePath: file,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.Email.trim()) errors.Email = "Email is required";
    if (!formData.FullName.trim()) errors.FullName = "Full name is required";
    if (!formData.DateOfBirth) errors.DateOfBirth = "Date of birth is required";
    if (!formData.Gender) errors.Gender = "Gender is required";
    if (!formData.Phone.trim()) errors.Phone = "Phone number is required";

    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const profileData = {
        UserID: formData.UserID,
        Email: formData.Email.trim(),
        FullName: formData.FullName.trim(),
        DOB: formData.DateOfBirth,
        Gender: formData.Gender,
        Mobile: formData.Phone.trim(),
        PostalAddress: formData.ResidentialAddress.trim(),
        ImagePath: formData.ProfilePath,
      };

      const response = await userAPI.updateUserProfile(profileData);

      if (response.data) {
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...user,
          Email: formData.Email,
          FullName: formData.FullName,
          DateOfBirth: formData.DateOfBirth,
          Gender: formData.Gender,
          Phone: formData.Phone,
          ResidentialAddress: formData.ResidentialAddress,
          ProfilePicture: previewImage || user.ProfilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setEditMode(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setFormData({
      UserID: user.UserID || "",
      Username: user.Username || "",
      FullName: user.FullName || "",
      Email: user.Email || "",
      DateOfBirth: user.DateOfBirth?.split("T")[0] || "",
      Phone: user.Phone || "",
      Gender: user.Gender || "M",
      ResidentialAddress: user.ResidentialAddress || "",
      RoleName: user.RoleName || "User",
      AccountStatus: user.AccountStatus || 0,
      ProfilePath: user.ProfilePicture || "",
    });
    setPreviewImage(user.ProfilePicture || null);
    setEditMode(false);
    setError(null);
    setFormErrors({});
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          overflow: "hidden",
        }}
      >
        <CardHeader
          title={
            <Typography variant="h4" fontWeight="bold" color="primary">
              My Profile
            </Typography>
          }
          action={
            editMode ? (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={submitting}
                  size={isMobile ? "small" : "medium"}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={submitting}
                  size={isMobile ? "small" : "medium"}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Edit Profile
              </Button>
            )
          }
          sx={{
            color: theme.palette.primary.contrastText,
            py: 2,
            px: 4,
          }}
        />

        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}
            >
              Profile updated successfully!
            </Alert>
          )}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}
            >
              {error}
            </Alert>
          )}

          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            alignItems="center"
            gap={4}
            mb={4}
          >
            <Box
              position="relative"
              sx={{
                width: isMobile ? 120 : 160,
                height: isMobile ? 120 : 160,
              }}
            >
              <Avatar
                src={previewImage || formData.ProfilePath}
                sx={{
                  width: "100%",
                  height: "100%",
                  fontSize: isMobile ? 48 : 64,
                  border: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                {formData.FullName?.charAt(0) || formData.Username.charAt(0)}
              </Avatar>
              {editMode && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    backgroundColor: theme.palette.background.paper,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    },
                  }}
                >
                  <CameraAlt />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </IconButton>
              )}
            </Box>

            <Box textAlign={isMobile ? "center" : "left"}>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {formData.FullName}
              </Typography>
              <Chip
                label={`@${formData.Username}`}
                variant="outlined"
                color="primary"
                sx={{ mb: 1 }}
              />
              <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                justifyContent={isMobile ? "center" : "flex-start"}
              >
                <Chip label={formData.RoleName} color="primary" size="small" />
                <Chip
                  label={formData.AccountStatus === 1 ? "Active" : "Inactive"}
                  color={formData.AccountStatus === 1 ? "success" : "error"}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.Username}
                disabled
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.FullName}
                helperText={formErrors.FullName}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.Email}
                helperText={formErrors.Email}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                disabled={!editMode}
                error={!!formErrors.DateOfBirth}
                helperText={formErrors.DateOfBirth}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.Phone}
                helperText={formErrors.Phone}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                disabled={!editMode}
                error={!!formErrors.Gender}
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  label="Gender"
                  variant="outlined"
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
                {formErrors.Gender && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formErrors.Gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="ResidentialAddress"
                multiline
                rows={3}
                value={formData.ResidentialAddress}
                onChange={handleInputChange}
                disabled={!editMode}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.action.hover,
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="body1">
              <strong>Member Since:</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonalProfile;
