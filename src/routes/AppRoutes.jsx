import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import SubmitComplaintPage from "../pages/citizen/SubmitComplaintPage";
import MyComplaintsPage from "../pages/citizen/MyComplaintsPage";
import ComplaintDetailsPage from "../pages/citizen/ComplaintDetailsPage";
import DepartmentDashboard from "../pages/department/DepartmentDashboard";
import DepartmentComplaintsPage from "../pages/department/DepartmentComplaintsPage";
import UpdateComplaintPage from "../pages/department/UpdateComplaintPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageDepartmentsPage from "../pages/admin/ManageDepartmentsPage";
import AllComplaintsPage from "../pages/admin/AllComplaintsPage";

const citizenLinks = [
  { to: "/citizen/dashboard", label: "Dashboard" },
  { to: "/citizen/submit", label: "Submit Complaint" },
  { to: "/citizen/complaints", label: "My Complaints" }
];

const departmentLinks = [
  { to: "/department/dashboard", label: "Dashboard" },
  { to: "/department/complaints", label: "Complaints List" }
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/departments", label: "Manage Departments" },
  { to: "/admin/complaints", label: "All Complaints" }
];

function HomeRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/citizen/*"
        element={
          <ProtectedRoute allowedRoles={["citizen"]}>
            <MainLayout links={citizenLinks}>
              <Routes>
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="submit" element={<SubmitComplaintPage />} />
                <Route path="complaints" element={<MyComplaintsPage />} />
                <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/department/*"
        element={
          <ProtectedRoute allowedRoles={["department"]}>
            <MainLayout links={departmentLinks}>
              <Routes>
                <Route path="dashboard" element={<DepartmentDashboard />} />
                <Route path="complaints" element={<DepartmentComplaintsPage />} />
                <Route path="complaints/:id/update" element={<UpdateComplaintPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout links={adminLinks}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="departments" element={<ManageDepartmentsPage />} />
                <Route path="complaints" element={<AllComplaintsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
