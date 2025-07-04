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
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      return;
    }

    try {
      const result = await login(credentials);
      console.log("Login response:", result);

      if (result?.success) {
        if (result.data) {
          const userData = result.data;

          if (userData.RoleId !== undefined) {
            if (userData.RoleId === 1) {
              navigate("/PatientSurvey");
            } else {
              navigate("/dashboard");
            }
          } else {
            console.error("RoleId not found in user data");
            navigate("/dashboard");
          }
        } else {
          console.error("No user data in response");
          navigate("/dashboard");
        }
      } else {
        throw new Error(result?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      error(err.message || "Login failed. Please try again.");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        p: isMobile ? 1 : 2,
        boxSizing: "border-box",
        overflow: "hidden",
        minWidth: isMobile ? "95vw" : "auto",
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={isMobile ? 1 : 4}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            p: isMobile ? 5 : 3,
            borderRadius: 3,
            width: "fit-content",
            maxWidth: isMobile ? "95vw" : "100%",
            height: "fit-content",
            maxHeight: isMobile ? "95vh" : "80vh",
            background: "rgba(255, 255, 255, 0.95)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: isMobile ? "100%" : "40%",
              height: isMobile ? "30%" : "100%",
              background: "linear-gradient(45deg, #1976d2, #2196f3)",
              zIndex: 0,
              opacity: isMobile ? 0 : 1,
              borderRadius: isMobile ? "3px 3px 0 0" : "3px 0 0 3px",
            },
          }}
        >
          {/* Left side - Welcome content */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 2,
              color: isMobile ? theme.palette.primary.main : "white",
              position: "relative",
              zIndex: 1,
              textAlign: isMobile ? "center" : "left",
              minHeight: isMobile ? "120px" : "auto",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              alignItems="flex-start"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 1,
                mr: 2,
                ...(isMobile ? {} : { color: "white" }),
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              sx={{
                mb: 3,
                ...(isMobile ? {} : { color: "rgba(255,255,255,0.8)" }),
              }}
            >
              Sign in to access your account
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
                  Don't have an account?
                </Typography>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      display: "inline-block",
                      fontSize: "0.875rem",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)", // light greyish white
                        borderRadius: 2,
                      },
                    }}
                  >
                    Create Account
                  </Box>
                </Link>
              </Box>
            )}
          </Box>

          {/* Right side - Form content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: isMobile ? 3 : 4,
              backgroundColor: "transparent",
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
              sx={{ width: "100%" }}
            >
              <TextField
                margin="dense"
                required
                fullWidth
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                size="small"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputBase-input": {
                    py: 1,
                    fontSize: "0.875rem",
                  },
                }}
              />

              <TextField
                margin="dense"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                size="small"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputBase-input": {
                    py: 1,
                    fontSize: "0.875rem",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body2">
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.primary.main,
                      fontSize: "0.75rem",
                    }}
                  >
                    Forgot password?
                  </Link>
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #1976d2, #2196f3)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1565c0, #1e88e5)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              {isMobile && (
                <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    Register
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

export default Login;
