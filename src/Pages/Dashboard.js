import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  MedicalServices,
  Notifications as NotificationsIcon,
  CheckCircle,
  Pending,
  RateReview,
  Send,
  Summarize,
  Circle,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";
import { dashboardAPI, notificationsAPI } from "../Api/api";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const params = {};
        if (user?.RoleId) params.RoleID = user.RoleId;
        if (user?.UserId) params.UserID = user.UserId;

        const response = await dashboardAPI.getDashboardStatistics(params);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        if (user?.RoleId) {
          const response = await notificationsAPI.getNotificationsByRole(
            user.RoleId
          );
          if (response.data.success) {
            setNotifications(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardStats();
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const formatNotificationTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString || "Just now";
      }
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Just now";
    }
  };

  const handleStatCardClick = (status) => {
    if (!user?.RoleId) return;

    switch (user.RoleId) {
      case 1: // Patient
        navigate("/AppStatsPatient");
        break;
      case 19: // Doctor
        navigate("/PrescriptionListDoc");
        break;
      case 24: // Pharmacist
        navigate("/AddInvoicePharma");
        break;
      case 23: // Sales
        navigate("/AttachInvoiceSales");
        break;
      // RoleId 2 doesn't navigate anywhere
      default:
        break;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!user?.RoleId) return;

    switch (user.RoleId) {
      case 1: // Patient
        navigate("/AppStatsPatient");
        break;
      case 19: // Doctor
        navigate("/PrescriptionListDoc");
        break;
      case 24: // Pharmacist
        navigate("/AddInvoicePharma");
        break;
      case 23: // Sales
        navigate("/AttachInvoiceSales");
        break;
      // RoleId 2 doesn't navigate anywhere
      default:
        break;
    }
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle fontSize="large" />;
      case "Pending":
        return <Pending fontSize="large" />;
      case "ReviewedByDoctor":
        return <RateReview fontSize="large" />;
      case "SentToSales":
        return <Send fontSize="large" />;
      case "Total":
        return <Summarize fontSize="large" />;
      default:
        return <Summarize fontSize="large" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50";
      case "Pending":
        return "#ff9800";
      case "ReviewedByDoctor":
        return "#2196f3";
      case "SentToSales":
        return "#9c27b0";
      case "Total":
        return "#1976d2";
      default:
        return "#607d8b";
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: isMobile ? 2 : 4,
        px: { xs: 1, sm: 3 },
        pb: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 4,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #1976d2, #2196f3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Medical Dashboard
        </Typography>
      </Box>

      {/* Tabs Section */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
          },
        }}
      >
        <Tab
          label={isMobile ? null : "Overview"}
          icon={<MedicalServices />}
          iconPosition="start"
        />
      </Tabs>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Loading...
                          </Typography>
                          <Typography
                            variant={isMobile ? "h5" : "h4"}
                            sx={{ fontWeight: 700 }}
                          >
                            -
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "#e0e0e0",
                            color: "#9e9e9e",
                            width: isMobile ? 40 : 56,
                            height: isMobile ? 40 : 56,
                          }}
                        >
                          <Summarize fontSize="large" />
                        </Avatar>
                      </Box>
                      <LinearProgress sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : stats ? (
              stats.map((stat) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.status}>
                  <StatCard
                    title={stat.status.replace(/([A-Z])/g, " $1").trim()}
                    value={stat.application_count}
                    icon={getStatusIcon(stat.status)}
                    color={getStatusColor(stat.status)}
                    onClick={() =>
                      user?.RoleId !== 2 && handleStatCardClick(stat.status)
                    }
                    clickable={user?.RoleId !== 2}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                  <Typography color="error">
                    Failed to load dashboard statistics
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Grid container spacing={3}>
            {/* Notifications Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2, height: "100%" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  <IconButton size="small">
                    <Badge
                      badgeContent={notifications.length}
                      color="primary"
                      max={99}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Box>
                {notificationsLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 150,
                    }}
                  >
                    <LinearProgress sx={{ width: "100%" }} />
                  </Box>
                ) : notifications.length > 0 ? (
                  <List
                    sx={{
                      maxHeight: 300,
                      overflow: "auto",
                      py: 0,
                    }}
                  >
                    {notifications.map((notification, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          borderBottom:
                            index !== notifications.length - 1
                              ? `1px solid ${theme.palette.divider}`
                              : "none",
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            cursor: user?.RoleId !== 2 ? "pointer" : "default",
                          },
                        }}
                        onClick={() =>
                          user?.RoleId !== 2 &&
                          handleNotificationClick(notification)
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Circle
                            sx={{
                              fontSize: "0.5rem",
                              color: notification.IsRead
                                ? theme.palette.text.disabled
                                : theme.palette.primary.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.IsRead
                                  ? "normal"
                                  : "bold",
                                color: notification.IsRead
                                  ? theme.palette.text.secondary
                                  : theme.palette.text.primary,
                              }}
                            >
                              {notification.Message}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatNotificationTime(notification.CreatedAt)}{" "}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 150,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No new notifications
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Application Status Distribution */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2, height: "100%" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Application Status Distribution
                  </Typography>
                </Box>
                {stats && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats
                          .filter((stat) => stat.status !== "Total")
                          .map((stat) => (
                            <TableRow
                              key={stat.status}
                              hover={user?.RoleId !== 2}
                              onClick={() =>
                                user?.RoleId !== 2 &&
                                handleStatCardClick(stat.status)
                              }
                              sx={{
                                cursor:
                                  user?.RoleId !== 2 ? "pointer" : "default",
                              }}
                            >
                              <TableCell>
                                <Chip
                                  label={stat.status
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${getStatusColor(
                                      stat.status
                                    )}20`,
                                    color: getStatusColor(stat.status),
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                {stat.application_count}
                              </TableCell>
                              <TableCell align="right">
                                {(
                                  (stat.application_count /
                                    stats.find((s) => s.status === "Total")
                                      .application_count) *
                                  100
                                ).toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

const StatCard = ({ title, value, icon, color, onClick, clickable }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.3s",
        "&:hover": clickable
          ? {
              transform: "translateY(-5px)",
              cursor: "pointer",
              boxShadow: theme.shadows[4],
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 700 }}
            >
              {value || "-"}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color,
              width: isMobile ? 40 : 56,
              height: isMobile ? 40 : 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <LinearProgress
          variant="determinate"
          value={0}
          sx={{
            mt: 2,
            height: 6,
            borderRadius: 3,
            backgroundColor: `${color}20`,
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Dashboard;
