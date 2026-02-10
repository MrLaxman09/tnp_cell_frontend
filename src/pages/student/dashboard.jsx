import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApplyJobDialog from "./Applyjob";

import {
  Briefcase,
  Calendar,
  CheckCircle,
  Search,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import api from "@/api/axios";

const stats = [
  {
    title: "Applied Jobs",
    value: "12",
    icon: Briefcase,
    description: "In the last 30 days",
  },
  {
    title: "Upcoming Interviews",
    value: "3",
    icon: Calendar,
    description: "Next: Google (Feb 20)",
  },
  {
    title: "Offers Received",
    value: "1",
    icon: CheckCircle,
    description: "Action required",
  },
  {
    title: "Profile Score",
    value: "85%",
    icon: User,
    description: "Add projects to improve",
  },
];

const recentApplications = [
  {
    company: "Google",
    role: "Associate Product Manager",
    date: "Feb 10, 2025",
    status: "Shortlisted",
  },
  {
    company: "Flipkart",
    role: "SDE",
    date: "Feb 5, 2025",
    status: "Rejected",
  },
  {
    company: "TCS",
    role: "System Engineer",
    date: "Jan 28, 2025",
    status: "Pending",
  },
];

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [driveError, setDriveError] = useState("");

  // Store only applied company IDs
  const [appliedCompanies, setAppliedCompanies] = useState([]);

  const navigate = useNavigate();

  // ===== FETCH LOGGED-IN USER =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // ===== FETCH COMPANIES =====
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/companies", {
          withCredentials: true,
        });

        setCompanies(res.data.companies || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setDriveError("Failed to load upcoming drives");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // ===== FETCH STUDENT APPLICATIONS =====
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await api.get("/applications/my", {
          withCredentials: true,
        });

        const appliedIds = res.data.applications.map((app) =>
          typeof app.companyId === "string"
            ? app.companyId
            : app.companyId?._id
        );

        setAppliedCompanies(appliedIds);
      } catch (error) {
        console.error("Failed to fetch my applications:", error);
      }
    };

    fetchMyApplications();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "Student"}! Here's your placement
              overview.
            </p>
          </div>

          <Button className="gap-2">
            <Search className="w-4 h-4" />
            Browse Jobs
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Drives */}
            <Card className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Upcoming Drives</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {driveError && (
                  <p className="text-center text-red-500">{driveError}</p>
                )}

                {companies.length === 0 && !driveError && (
                  <p className="text-center text-muted-foreground">
                    No upcoming drives available.
                  </p>
                )}

                {companies.map((company) => {
                  const companyName =
                    company.companyName || company.name || "Unknown Company";

                  const arrivalDate = company.arrivalDate
                    ? new Date(company.arrivalDate).toDateString()
                    : "TBA";

                  const isApplied = appliedCompanies.includes(company._id);

                  return (
                    <div
                      key={company._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border shrink-0">
                          <span className="font-bold text-lg">
                            {companyName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{companyName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {company.role || "Role TBA"} • {arrivalDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {isApplied ? (
                          <>
                            <Badge variant="secondary">Applied</Badge>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="default">Eligible</Badge>
                            <ApplyJobDialog
                              job={{
                                _id: company._id,
                                company: companyName,
                                role: company.role,
                                date: company.arrivalDate,
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl">
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{app.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.role}
                        </p>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === "Shortlisted"
                              ? "default"
                              : app.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {app.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied on {app.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl">My Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>

                <h3 className="font-bold text-lg">
                  {user?.name || "Student"}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {user?.course || "Course not set"} • Final Year
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/student/edit-profile")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
