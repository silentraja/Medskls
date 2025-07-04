import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Divider,
  Avatar,
  styled,
  Tooltip,
  Collapse,
  Badge,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DownloadIcon from "@mui/icons-material/Download";
import { Assessment } from "@mui/icons-material";

const drawerWidth = 240;
const collapsedWidth = 72;

const DrawerHeader = styled("div")(({ theme }) => ({
  backgroundColor: "#f0f8ff",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(90deg, #3f51b5, #2196f3)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  fontWeight: 700,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  fontSize: "1.5rem",
  padding: theme.spacing(0.5, 1),
  borderRadius: "4px",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: -4,
    width: "100%",
    height: "2px",
    background: "linear-gradient(90deg, #3f51b5, #2196f3)",
    borderRadius: "2px",
  },
}));

const NavItem = styled(ListItemButton)(({ theme, level = 0, selected }) => ({
  borderRadius: 6,
  margin: theme.spacing(0.5, 1),
  minHeight: 44,
  paddingLeft: theme.spacing(level > 0 ? 4 : 3),
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.lighter,
    color: theme.palette.primary.dark,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    },
  },
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.primary.light,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const NavSectionButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 6,
  margin: theme.spacing(0.5, 1),
  minHeight: 44,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationCount] = useState(3);
  const hideDrawer = ["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    if (isAuthenticated) {
      setOpenMenus({});
      setMobileOpen(false);
    }
  }, [isAuthenticated]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Menu items definitions remain the same...
  const adminMenuItems = [
    {
      text: "Personal Profile",
      icon: <PersonIcon />,
      path: "/PersonalProfile",
    },
    { text: "Add User", icon: <PeopleIcon />, path: "/AddUser" },
    { text: "User Login", icon: <LoginIcon />, path: "/UserLogin" },
    { text: "User Role", icon: <LockIcon />, path: "/UserRoles" },
    { text: "Change Password", icon: <LockIcon />, path: "/ChangePassword" },
    {
      text: "Applications Report",
      icon: <Assessment />,
      path: "/ApplicationReport",
    },
  ];

  const patientMenuItems = [
    {
      text: "Personal Profile",
      icon: <PersonIcon />,
      path: "/PersonalProfilePatient",
    },
    { text: "My Request", icon: <DescriptionIcon />, path: "/PatientSurvey" },
    {
      text: "Application Status",
      icon: <DescriptionIcon />,
      path: "/AppStatsPatient",
    },
    {
      text: "Download Invoice",
      icon: <DownloadIcon />,
      path: "/PatientInvoice",
    },
  ];

  const doctorMenuItems = [
    {
      text: "Personal Profile",
      icon: <PersonIcon />,
      path: "/PersonalProfileDoc",
    },
    {
      text: "Prescription List",
      icon: <MedicalServicesIcon />,
      path: "/PrescriptionListDoc",
    },
  ];

  const pharmacistMenuItems = [
    {
      text: "Personal Profile",
      icon: <PersonIcon />,
      path: "/PersonalProfilePharma",
    },
    {
      text: "Add Invoice",
      icon: <DescriptionIcon />,
      path: "/AddInvoicePharma",
    },
  ];

  const salesMenuItems = [
    {
      text: "Personal Profile",
      icon: <PersonIcon />,
      path: "/PersonalProfileSaTeam",
    },
    {
      text: "Attach Final Invoice",
      icon: <DescriptionIcon />,
      path: "/AttachInvoiceSales",
    },
    {
      text: "Patient Receipts",
      icon: <EmailIcon />,
      path: "/SendInvoiceToPatient",
    },
  ];

  // getMenuSectionsForRole function remains the same...
  const getMenuSectionsForRole = () => {
    if (!user || !user.RoleId) return [];

    const roleId = user.RoleId;

    const sections = [];

    // Only show Dashboard if not a basic user (RoleId !== 1)
    if (roleId !== 1) {
      sections.push({
        key: "dashboard",
        title: "Dashboard",
        icon: <DashboardIcon />,
        items: [
          { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        ],
      });
    }

    // Role-specific sections
    switch (roleId) {
      case 1: // User
        sections.push({
          key: "patient",
          title: "Patient's Dashboard",
          icon: <PersonIcon />,
          items: patientMenuItems,
        });
        break;

      case 2: // Admin
        sections.push({
          key: "admin",
          title: "Admin Dashboard",
          icon: <DashboardIcon />,
          items: adminMenuItems,
        });
        sections.push({
          key: "patient",
          title: "Patient's Dashboard",
          icon: <PersonIcon />,
          items: patientMenuItems,
        });
        sections.push({
          key: "doctor",
          title: "Doctor's Dashboard",
          icon: <MedicalServicesIcon />,
          items: doctorMenuItems,
        });
        sections.push({
          key: "pharmacist",
          title: "Pharmacist's Dashboard",
          icon: <LocalPharmacyIcon />,
          items: pharmacistMenuItems,
        });
        sections.push({
          key: "sales",
          title: "Sales Team Dashboard",
          icon: <PointOfSaleIcon />,
          items: salesMenuItems,
        });
        break;

      case 19: // Physician
        sections.push({
          key: "doctor",
          title: "Doctor's Dashboard",
          icon: <MedicalServicesIcon />,
          items: doctorMenuItems,
        });
        break;

      case 23: // Billing Specialist
        sections.push({
          key: "sales",
          title: "Sales Team Dashboard",
          icon: <PointOfSaleIcon />,
          items: salesMenuItems,
        });
        break;

      case 24: // Pharmacist
        sections.push({
          key: "pharmacist",
          title: "Pharmacist's Dashboard",
          icon: <LocalPharmacyIcon />,
          items: pharmacistMenuItems,
        });
        break;

      default:
        // Default to patient menu if role not matched
        sections.push({
          key: "patient",
          title: "Patient's Dashboard",
          icon: <PersonIcon />,
          items: patientMenuItems,
        });
    }

    return sections;
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item, index) => (
      <NavItem
        key={index}
        component={Link}
        to={item.path}
        selected={location.pathname === item.path}
        level={level}
        onClick={() => {
          if (isMobile) {
            setMobileOpen(false);
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: "36px",
            color:
              location.pathname === item.path
                ? theme.palette.primary.dark
                : theme.palette.text.secondary,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: "0.875rem",
            fontWeight: location.pathname === item.path ? "600" : "normal",
            color:
              location.pathname === item.path
                ? theme.palette.primary.dark
                : theme.palette.text.primary,
          }}
        />
      </NavItem>
    ));
  };

  const renderMenuSection = (section) => {
    const isOpen = openMenus[section.key] ?? false; // Changed from true to false

    return (
      <React.Fragment key={section.key}>
        <NavSectionButton onClick={() => toggleMenu(section.key)}>
          <ListItemIcon
            sx={{
              minWidth: "36px",
              color: isOpen
                ? theme.palette.primary.dark
                : theme.palette.text.secondary,
            }}
          >
            {section.icon}
          </ListItemIcon>
          {desktopOpen && (
            <>
              <ListItemText
                primary={section.title}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: isOpen
                    ? theme.palette.primary.dark
                    : theme.palette.text.primary,
                }}
              />
              {isOpen ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </>
          )}
        </NavSectionButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 1 }}>
            {renderMenuItems(section.items, 1)}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme.palette.background.paper,
        backgroundColor: "#f0f8ff",
      }}
    >
      <DrawerHeader>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            {desktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </DrawerHeader>

      {isAuthenticated && desktopOpen && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: "#f0f8ff",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: "1rem",
            }}
          >
            {user?.FullName?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="subtitle2" noWrap fontWeight="500">
              {user?.FullName || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.Email || "user@example.com"}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider />

      <List
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 1,
          "& .MuiListItemButton-root": {
            borderRadius: 6,
            mx: 1,
            my: 0.5,
            minHeight: 44,
            justifyContent: desktopOpen ? "initial" : "center",
            px: 2,
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.lighter,
              color: theme.palette.primary.dark,
              "& .MuiListItemIcon-root": {
                color: theme.palette.primary.dark,
              },
            },
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
          "& .MuiListItemIcon-root": {
            minWidth: 0,
            mr: desktopOpen ? 2 : "auto",
            justifyContent: "center",
          },
          "& .MuiListItemText-root": {
            opacity: desktopOpen ? 1 : 0,
            transition: theme.transitions.create("opacity", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }}
      >
        {isAuthenticated ? (
          <>
            {getMenuSectionsForRole().map((section) =>
              section.items.length === 1 ? (
                <Tooltip
                  key={section.key}
                  title={section.title}
                  placement="right"
                  arrow
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to={section.items[0].path}
                      selected={location.pathname === section.items[0].path}
                      onClick={() => {
                        if (isMobile) {
                          setMobileOpen(false);
                        }
                      }}
                      sx={{
                        justifyContent: desktopOpen ? "initial" : "center",
                        px: desktopOpen ? 2 : "12px",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color:
                            location.pathname === section.items[0].path
                              ? theme.palette.primary.dark
                              : theme.palette.text.secondary,
                          minWidth: "36px",
                          mr: desktopOpen ? 2 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {section.icon}
                      </ListItemIcon>
                      {desktopOpen && (
                        <ListItemText
                          primary={section.title}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight:
                              location.pathname === section.items[0].path
                                ? "600"
                                : "normal",
                            color:
                              location.pathname === section.items[0].path
                                ? theme.palette.primary.dark
                                : theme.palette.text.primary,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              ) : (
                renderMenuSection(section)
              )
            )}
          </>
        ) : (
          <Tooltip title="Login" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/login"
                selected={location.pathname === "/login"}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === "/login"
                        ? theme.palette.primary.dark
                        : theme.palette.text.secondary,
                  }}
                >
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Login"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight:
                      location.pathname === "/login" ? "600" : "normal",
                    color:
                      location.pathname === "/login"
                        ? theme.palette.primary.dark
                        : theme.palette.text.primary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}
      </List>

      {isAuthenticated && (
        <>
          <Divider />
          <List sx={{ py: 1 }}>
            <Tooltip title="Logout" placement="right" arrow>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setOpenMenus({});
                    logout(); // Clear auth state
                    navigate("/login"); // Redirect to login
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      color: theme.palette.text.primary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: {
            md: hideDrawer
              ? "100%"
              : `calc(100% - ${desktopOpen ? drawerWidth : collapsedWidth}px)`,
          },
          ml: {
            md: hideDrawer
              ? 0
              : `${desktopOpen ? drawerWidth : collapsedWidth}px`,
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: "none",
          backgroundColor: "#f0f8ff",
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: "64px !important" }}>
          {!hideDrawer && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Box
              component="img"
              src="/images/WEBLOGO.png"
              alt="Medskls Logo"
              sx={{
                height: 40,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {!hideDrawer && (
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : desktopOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: isMobile
                ? drawerWidth
                : desktopOpen
                ? drawerWidth
                : collapsedWidth,
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              borderRight: "none",
              boxShadow: "1px 0 4px rgba(0,0,0,0.08)",
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: hideDrawer
              ? "100%"
              : `calc(100% - ${desktopOpen ? drawerWidth : collapsedWidth}px)`,
          },
          ml: {
            md: hideDrawer
              ? 0
              : `${desktopOpen ? drawerWidth : collapsedWidth}px`,
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          height: "100vh",
          overflow: "auto",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Only add vertical spacing if AppBar is shown */}
        {!hideDrawer && <Toolbar />}

        <Box
          sx={{
            maxWidth: 1700,
            my: 2,
          }}
        >
          <Outlet />
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
