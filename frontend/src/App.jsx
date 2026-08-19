import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateRequest from "./pages/CreateRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import MyRequests from "./pages/MyRequests";
import Reports from "./pages/Reports";
import ParentApproval from "./pages/ParentApproval";
import GuardVerify from "./pages/GuardVerify";
import AuditLogs from "./pages/AuditLogs";
import MyProfile from "./pages/MyProfile";
import AdminStudents from "./pages/AdminStudents";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

       <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

        <Route
          path="/student/create-request"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CreateRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-requests"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warden-dashboard"
          element={
            <ProtectedRoute allowedRoles={["warden", "admin", "superadmin"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guard-dashboard"
          element={
            <ProtectedRoute allowedRoles={["guard", "admin", "superadmin"]}>
              <GuardDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["warden", "admin", "superadmin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
         <Route path="/parent/approve/:parentToken" element={<ParentApproval />} 
         
         />

         <Route
          path="/guard/verify/:qrToken"
          element={
            <ProtectedRoute allowedRoles={["guard", "admin", "superadmin"]}>
              <GuardVerify />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />






        </Routes>
        </BrowserRouter>
          
        
      );
}

export default App;