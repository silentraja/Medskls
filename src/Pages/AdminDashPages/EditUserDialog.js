import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Alert,
} from "@mui/material";
import { userService } from "../../Context/authService";

const EditUserDialog = ({
  open,
  onClose,
  userId,
  onUserUpdated,
  roles = [], // Ensure roles has a default value
}) => {
  const [userData, setUserData] = useState({
    UserID: "",
    Email: "",
    FullName: "",
    DOB: "",
    Gender: "",
    Mobile: "",
    PostalAddress: "",
    ImagePath: null,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUserData({
        UserID: "",
        Email: "",
        FullName: "",
        DOB: "",
        Gender: "",
        Mobile: "",
        PostalAddress: "",
        ImagePath: null,
      });
      setPreviewImage(null);
      setError(null);
      setFormErrors({});
    }
  }, [open]);

  // Fetch user data when dialog opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!open || !userId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await userService.getUserList(userId);

        // Check if response.data.data exists and is an array with at least one item
        if (
          response.data.success &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const user = response.data.data[0];
          setUserData({
            UserID: user.UserID || userId,
            Email: user.Email || "",
            FullName:
              user.FullName ||
              `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
            DOB: user.DateOfBirth ? formatDateForInput(user.DateOfBirth) : "",
            Gender:
              user.Gender === "M"
                ? "Male"
                : user.Gender === "F"
                ? "Female"
                : "Other",
            Mobile: user.Phone || user.Mobile || "",
            PostalAddress: user.ResidentialAddress || user.PostalAddress || "",
            ImagePath: user.ProfilePath || null,
          });

          if (user.ProfilePath) {
            setPreviewImage(user.ProfilePath);
          }
        } else {
          throw new Error("User data not found or invalid format");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [open, userId, roles]);

  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
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
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Update user data with the file
      setUserData((prev) => ({
        ...prev,
        ImagePath: file,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!userData.Email.trim()) errors.Email = "Email is required";
    if (!userData.FullName.trim()) errors.FullName = "Full name is required";
    if (!userData.DOB) errors.DOB = "Date of birth is required";
    if (!userData.Gender) errors.Gender = "Gender is required";
    if (!userData.Mobile.trim()) errors.Mobile = "Mobile number is required";

    // Email validation
    if (userData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.Email)) {
      errors.Email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      // Prepare the profile data
      const profileData = {
        UserID: userId,
        Email: userData.Email.trim(),
        FullName: userData.FullName.trim(),
        DOB: userData.DOB,
        Gender:
          userData.Gender === "Male"
            ? "M"
            : userData.Gender === "Female"
            ? "F"
            : "O",
        Mobile: userData.Mobile.trim(),
        PostalAddress: userData.PostalAddress.trim(),
        ImagePath: userData.ImagePath,
      };

      const response = await userService.updateUserProfile(profileData);

      if (response.data.success) {
        onUserUpdated();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update profile");
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "common.white",
          fontWeight: 600,
          py: 2,
        }}
      >
        Edit User Profile
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="Email"
                  type="email"
                  value={userData.Email}
                  onChange={handleInputChange}
                  error={!!formErrors.Email}
                  helperText={formErrors.Email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="FullName"
                  value={userData.FullName}
                  onChange={handleInputChange}
                  error={!!formErrors.FullName}
                  helperText={formErrors.FullName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="DOB"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={userData.DOB}
                  onChange={handleInputChange}
                  error={!!formErrors.DOB}
                  helperText={formErrors.DOB}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.Gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    name="Gender"
                    value={userData.Gender}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.Gender && (
                    <Typography variant="caption" color="error">
                      {formErrors.Gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="Mobile"
                  value={userData.Mobile}
                  onChange={handleInputChange}
                  error={!!formErrors.Mobile}
                  helperText={formErrors.Mobile}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Postal Address"
                  name="PostalAddress"
                  multiline
                  rows={3}
                  value={userData.PostalAddress}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || submitting}
        >
          {submitting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
