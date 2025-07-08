import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./Shared/Layout";
import { AuthProvider } from "./Context/AuthContext";
import { BookProvider } from "./Context/BookContext";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import BookSearch from "./Pages/BookSearch";
import BookDetails from "./Pages/BookDetails";
import AddFavoriteForm from "./Pages/AddFavoriteForm";
import PatientSurvey from "./Pages/PatientSurvey";

import AddUser from "./Pages/AdminDashPages/AddUser";
import PersonalProfile from "./Pages/AdminDashPages/PersonalProfile";
import ChangePassword from "./Pages/AdminDashPages/ChangePassword";
import UserRoles from "./Pages/AdminDashPages/UserRoles";
import UserLogin from "./Pages/AdminDashPages/UserLogin";

import PersonalProfilePatient from "./Pages/PatientPages/PersonalProfilePatient";
import AppStatsPatient from "./Pages/PatientPages/AppStatsPatient";
import PatientInvoice from "./Pages/PatientPages/PatientInvoice";

import PersonalProfileDoc from "./Pages/DoctorPages/PersonalProfileDoc";
import PatientApplicationDoc from "./Pages/DoctorPages/PatientApplicationDoct";
import PrescriptionListDoc from "./Pages/DoctorPages/PrescriptionListDoc";

import PersonalProfilePharma from "./Pages/PharmacitsPages/PersonalProfilePharma";
import PatientApplicationPharma from "./Pages/PharmacitsPages/PatientApplicationPharma";
import AddInvoicePharma from "./Pages/PharmacitsPages/AddInvoicePharma";

import PersonalProfileSaTeam from "./Pages/SalesTeamPages/PersonalProfileSaTeam";
import PatientApplicationSales from "./Pages/SalesTeamPages/PatientApplicationSales";
import AddInvoiceSales from "./Pages/SalesTeamPages/AttachInvoiceSales";
import SendInvoiceToPatient from "./Pages/SalesTeamPages/SendInvoiceToPatient";

import PrivateRoute from "./Components/PrivateRoute";
import ApplicationReport from "./Pages/AdminDashPages/ApplicationReport";
import PatientSurveyWithoutLogin from "./Pages/PatientSurveyWithoutLogin";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BookProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/Patient-Survey-out" element={<PatientSurveyWithoutLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/Patient-Survey-out" />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute deniedRoles={[1]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route path="/search" element={<BookSearch />} />
              <Route path="/PatientSurvey" element={<PatientSurvey />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/add-favorite" element={<AddFavoriteForm />} />

              {/* Admin Routes - RoleId: 2 */}
              <Route
                path="/AddUser"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <AddUser />
                  </PrivateRoute>
                }
              />

              <Route
                path="/PersonalProfile"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <PersonalProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ChangePassword"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
              <Route
                path="/UserRoles"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <UserRoles />
                  </PrivateRoute>
                }
              />
              <Route
                path="/UserLogin"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <UserLogin />
                  </PrivateRoute>
                }
              />

              <Route
                path="/ApplicationReport"
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <ApplicationReport />
                  </PrivateRoute>
                }
              />

              {/* Patient Routes - RoleId: 1 */}
              <Route
                path="/PersonalProfilePatient"
                element={
                  <PrivateRoute allowedRoles={[1]}>
                    <PersonalProfilePatient />
                  </PrivateRoute>
                }
              />
              <Route
                path="/AppStatsPatient"
                element={
                  <PrivateRoute allowedRoles={[1]}>
                    <AppStatsPatient />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PatientInvoice"
                element={
                  <PrivateRoute allowedRoles={[1]}>
                    <PatientInvoice />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes - RoleId: 19 */}
              <Route
                path="/PersonalProfileDoc"
                element={
                  <PrivateRoute allowedRoles={[19]}>
                    <PersonalProfileDoc />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PatientApplicationDoc"
                element={
                  <PrivateRoute allowedRoles={[19]}>
                    <PatientApplicationDoc />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PrescriptionListDoc"
                element={
                  <PrivateRoute allowedRoles={[19]}>
                    <PrescriptionListDoc />
                  </PrivateRoute>
                }
              />

              {/* Pharmacist Routes - RoleId: 24 */}
              <Route
                path="/PersonalProfilePharma"
                element={
                  <PrivateRoute allowedRoles={[24]}>
                    <PersonalProfilePharma />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PatientApplicationPharma"
                element={
                  <PrivateRoute allowedRoles={[24]}>
                    <PatientApplicationPharma />
                  </PrivateRoute>
                }
              />
              <Route
                path="/AddInvoicePharma"
                element={
                  <PrivateRoute allowedRoles={[24]}>
                    <AddInvoicePharma />
                  </PrivateRoute>
                }
              />

              {/* Sales Team Routes - RoleId: 27 (Assuming) */}
              <Route
                path="/PersonalProfileSaTeam"
                element={
                  <PrivateRoute allowedRoles={[23]}>
                    <PersonalProfileSaTeam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PatientApplicationSales"
                element={
                  <PrivateRoute allowedRoles={[23]}>
                    <PatientApplicationSales />
                  </PrivateRoute>
                }
              />
              <Route
                path="/AttachInvoiceSales"
                element={
                  <PrivateRoute allowedRoles={[23]}>
                    <AddInvoiceSales />
                  </PrivateRoute>
                }
              />
              <Route
                path="/SendInvoiceToPatient"
                element={
                  <PrivateRoute allowedRoles={[23]}>
                    <SendInvoiceToPatient />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </BookProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
