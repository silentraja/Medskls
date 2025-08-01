import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Fade,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Lock,
  Person,
  Cake,
  Phone,
  Home,
  Wc,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";

const Register = () => {
  const location = useLocation();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasPendingSurvey, setHasPendingSurvey] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const pendingSurvey = localStorage.getItem("pendingPatientSubmission");
    const fromSurvey = location.state?.fromSurvey;

    if (fromSurvey && location.state?.surveyData?.personalInfo) {
      const { personalInfo } = location.state.surveyData;
      setUserData((prev) => ({
        ...prev,
        fullName: personalInfo.fullName || "",
        email: personalInfo.email || "",
        mobile: personalInfo.phone || "",
        address: personalInfo.address || "",
        gender: personalInfo.gender || "",
        dob: personalInfo.dob || "",
      }));
    }

    if (pendingSurvey) {
      setHasPendingSurvey(true);
    }
  }, [location.state]);

  const validateFields = () => {
    const errors = {};
    if (!userData.username) errors.username = "Username is required.";
    if (!userData.email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!userData.password) {
      errors.password = "Password is required.";
    } else if (userData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const result = await register(userData);
      if (result.success) {
        if (hasPendingSurvey) {
          navigate("/patient-survey-out");
        } else {
          navigate("/login");
        }
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: isMobile ? 1 : 2,
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={isMobile ? 0 : 4}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            borderRadius: 3,
            width: "100%",
            maxWidth: isMobile ? "100%" : 1100,
            maxHeight: isMobile ? "90vh" : "80vh",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: isMobile ? 0 : "30%",
              height: isMobile ? "120px" : "100%",
              background: "linear-gradient(45deg, #F1BD2B, #FFD95A)", // ✅ updated
              zIndex: 0,
              opacity: isMobile ? 0.1 : 1,
              borderRadius: isMobile ? "3px 3px 0 0" : "3px 0 0 3px",
            },
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              flex: isMobile ? 0 : 0.6,
              p: isMobile ? 5 : 3,
              color: isMobile ? theme.palette.primary.main : "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: isMobile ? "flex-start" : "center",
              zIndex: 1,
              textAlign: isMobile ? "center" : "left",
              minHeight: isMobile ? "120px" : "auto",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 700, mb: 1 }}
            >
              {hasPendingSurvey
                ? "Complete Your Registration"
                : "Create Account"}
            </Typography>
            <Typography variant={isMobile ? "body2" : "body1"} sx={{ mb: 3 }}>
              {hasPendingSurvey
                ? "Finish creating your account to submit your survey"
                : "Join us today and get started!"}
            </Typography>
            {!isMobile && (
              <Box sx={{ mt: "auto" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.875rem",
                  }}
                >
                  Already have an account?
                </Typography>
                <Link to="/login">
                  <Box
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      py: 1,
                      px: 1,
                      ml: -1,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: 2,
                      },
                    }}
                  >
                    Sign In
                  </Box>
                </Link>
              </Box>
            )}
          </Box>

          {/* Right side */}
          <Box
            sx={{
              flex: 1.4,
              p: isMobile ? 2 : 3,
              backgroundColor: "transparent",
              overflowY: "auto",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hasPendingSurvey && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have an incomplete survey. Your information will be saved
                after registration.
              </Alert>
            )}

            {error && (
              <Typography
                color="error"
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  textAlign: "center",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </Typography>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {[
                ["username", "email", AccountCircle, Email],
                ["password", "fullName", Lock, Person],
                ["dob", "gender", Cake, null],
                ["mobile", "address", Phone, Home],
              ].map(([field1, field2, Icon1, Icon2], index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 2,
                  }}
                >
                  {[field1, field2].map((field, idx) => {
                    const Icon = idx === 0 ? Icon1 : Icon2;
                    if (!field) return null;
                    if (field === "dob") {
                      return (
                        <TextField
                          key={field}
                          fullWidth
                          size="small"
                          label="Date of Birth"
                          name="dob"
                          type="date"
                          value={userData.dob}
                          onChange={handleChange}
                          error={Boolean(fieldErrors.dob)}
                          helperText={fieldErrors.dob}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Cake fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      );
                    }

                    if (field === "gender") {
                      return (
                        <FormControl
                          key={field}
                          fullWidth
                          size="small"
                          error={Boolean(fieldErrors.gender)}
                        >
                          <InputLabel>Gender</InputLabel>
                          <Select
                            name="gender"
                            value={userData.gender}
                            label="Gender"
                            onChange={handleChange}
                            startAdornment={
                              <InputAdornment position="start">
                                <Wc fontSize="small" />
                              </InputAdornment>
                            }
                          >
                            <MenuItem value="M">Male</MenuItem>
                            <MenuItem value="F">Female</MenuItem>
                            <MenuItem value="O">Other</MenuItem>
                          </Select>
                        </FormControl>
                      );
                    }

                    return (
                      <TextField
                        key={field}
                        fullWidth
                        size="small"
                        required={["username", "password", "email"].includes(
                          field
                        )}
                        type={field === "password" ? "password" : "text"}
                        label={
                          field.charAt(0).toUpperCase() +
                          field.slice(1).replace("Name", " Name")
                        }
                        name={field}
                        value={userData[field]}
                        onChange={handleChange}
                        error={Boolean(fieldErrors[field])}
                        helperText={fieldErrors[field]}
                        InputProps={{
                          startAdornment: Icon ? (
                            <InputAdornment position="start">
                              <Icon fontSize="small" />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                    );
                  })}
                </Box>
              ))}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.25,
                  fontWeight: 600,
                  borderRadius: 1,
                  background: "linear-gradient(45deg, #F1BD2B, #FFD95A)", // ✅ updated
                  "&:hover": {
                    background: "linear-gradient(45deg, #D9A500, #F1BD2B)", // ✅ updated
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : hasPendingSurvey ? (
                  "Complete Registration & Submit Survey"
                ) : (
                  "Register"
                )}
              </Button>

              {isMobile && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;
