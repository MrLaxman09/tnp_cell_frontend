import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Login from "./components/landing/Login";
import Signup from "./components/landing/Signup";
import AdminLayout from "./components/admin/AdminLayout";

import StudentDashboard from "./pages/student/dashboard";
import EditProfile from "./pages/student/EditProfile";
import ApplyJob from "./pages/student/Applyjob";

import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import AdminCompanies from "./pages/admin/companies";
import AdminPlacements from "./pages/admin/placements";
import AdminTrainings from "./pages/admin/Trainings";
import AdminReports from "./pages/admin/Reports";
import { AdminSettings } from "./pages/admin/ComingSoon";
import Applications from "@/pages/admin/Applications";

// ✅ IMPORTANT: Correct path for new file
import AdminHighlights from "./pages/admin/Highlights";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminLogin />} />

            {/* ===== PROTECTED STUDENT ROUTES ===== */}
            <Route
              element={<ProtectedRoute allowedRoles={["user", "admin"]} />}
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/edit-profile" element={<EditProfile />} />
              <Route path="/student/apply-job" element={<ApplyJob />} />
            </Route>

            {/* ===== ADMIN ROUTES ===== */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="students" element={<Students />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="placements" element={<AdminPlacements />} />
                <Route path="trainings" element={<AdminTrainings />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="applications" element={<Applications />} />

                {/* ✅ NEW HIGHLIGHTS ADMIN PAGE */}
                <Route path="highlights" element={<AdminHighlights />} />
              </Route>
            </Route>

            {/* ===== 404 ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
