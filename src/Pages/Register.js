import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userData.username || !userData.password || !userData.email) {
      setError("Required fields are missing");
      setLoading(false);
      return;
    }

    try {
      const result = await register(userData);
      if (result.success) {
        navigate("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: isMobile ? 1 : 2,
        boxSizing: "border-box",
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
            maxWidth: isMobile ? "100%" : 1100, // Reduced from 1200 to 1100
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
              background: "linear-gradient(45deg, #1976d2, #2196f3)",
              zIndex: 0,
              opacity: isMobile ? 0.1 : 1,
              borderRadius: isMobile ? "3px 3px 0 0" : "3px 0 0 3px",
            },
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              flex: isMobile ? 0 : 0.6, // Reduced from 0.8 to 0.6
              p: isMobile ? 5 : 3,
              color: isMobile ? theme.palette.primary.main : "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: isMobile ? "flex-start" : "center",
              position: "relative",
              zIndex: 1,
              textAlign: isMobile ? "center" : "left",
              minHeight: isMobile ? "120px" : "auto",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                mb: 1,
                ...(isMobile ? {} : { color: "white" }),
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              sx={{
                mb: 3,
                ...(isMobile ? {} : { color: "rgba(255,255,255,0.8)" }),
              }}
            >
              Join us today and get started!
            </Typography>
            {!isMobile && (
              <Box sx={{ mt: "auto" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}
                >
                  Already have an account?
                </Typography>
                <Link to="/login">
                  <Box
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      display: "inline-block",
                      fontSize: "0.875rem",
                      py: 1,
                      px: 1,
                      ml: -1,
                      borderRadius: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)", // light greyish white
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

          {/* Right Section */}
          <Box
            sx={{
              flex: 1.4, // Increased from 1.2 to 1.4
              p: isMobile ? 2 : 3,
              pl: isMobile ? 2 : 1,
              backgroundColor: "transparent",
              overflowY: "auto",
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 1.5 : 2,
                flex: 1,
              }}
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
                    flex: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {field1 === "dob" ? (
                      <TextField
                        fullWidth
                        size="small"
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={userData.dob}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon1 fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: isMobile ? 1.5 : 2 }}
                      />
                    ) : (
                      <TextField
                        required={
                          field1 === "username" ||
                          field1 === "password" ||
                          field1 === "email"
                        }
                        fullWidth
                        size="small"
                        label={
                          field1.charAt(0).toUpperCase() +
                          field1.slice(1).replace("Name", " Name")
                        }
                        name={field1}
                        type={field1 === "password" ? "password" : "text"}
                        value={userData[field1]}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: Icon1 ? (
                            <InputAdornment position="start">
                              <Icon1 fontSize="small" />
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{ mb: isMobile ? 1.5 : 2 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {field2 === "gender" ? (
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{ mb: isMobile ? 1.5 : 2 }}
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
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label={
                          field2.charAt(0).toUpperCase() +
                          field2.slice(1).replace("Name", " Name")
                        }
                        name={field2}
                        value={userData[field2]}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: Icon2 ? (
                            <InputAdornment position="start">
                              <Icon2 fontSize="small" />
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{ mb: isMobile ? 1.5 : 2 }}
                      />
                    )}
                  </Box>
                </Box>
              ))}

              <Box sx={{ mt: "auto" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: isMobile ? 1 : 1.25,
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    borderRadius: 1,
                    background: "linear-gradient(45deg, #1976d2, #2196f3)",
                    fontWeight: 600,
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #1e88e5)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Register"
                  )}
                </Button>

                {isMobile && (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", mt: 2, fontSize: "0.875rem" }}
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
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;
