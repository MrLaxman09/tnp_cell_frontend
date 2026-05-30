import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApplyJobDialog from "./Applyjob";
import EditProfileDialog from "./EditProfile";

import {
  User,
  Bell,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import api from "@/api/axios";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [driveError, setDriveError] = useState("");

  // Store only applied company IDs
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // eligibleCourses: ["BCA", "BTech CSE", "BTech IT"];
  // const isEligible = company.eligibleCourses?.includes(user?.course);

  const navigate = useNavigate();

  // ===== FETCH LOGGED-IN USER =====
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

  useEffect(() => {
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

        setMyApplications(res.data.applications);
        const appliedIds = res.data.applications.map((app) =>
          typeof app.companyId === "string"
            ? app.companyId
            : app.companyId?._id,
        );

        setAppliedCompanies(appliedIds);
      } catch (error) {
        console.error("Failed to fetch my applications:", error);
      }
    };

    fetchMyApplications();
  }, []);

  // ===== DERIVED NOTIFICATIONS =====
  const notifications = [
    ...companies.map((c) => ({
      id: c._id,
      title: `New Drive: ${c.companyName || c.name || "Company"}`,
      desc: `Role: ${c.role || "N/A"}`,
      date: c.arrivalDate,
      type: "drive",
    })),
    ...myApplications.map((a) => ({
      id: a._id,
      title: `Application Update`,
      desc: `Applied to ${a.company || a.companyId?.companyName} (${a.status})`,
      date: a.createdAt,
      type: "app",
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="text-center mt-20 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  // ===== EXPORT DRIVES TO CSV =====
  const exportDrivesCsv = () => {
    if (!companies.length) {
      alert("No drives to export.");
      return;
    }

    const headers = [
      "Company Name",
      "Role",
      "Job Type",
      "Location",
      "Package",
      "Eligibility",
      "Arrival Date",
      "Last Date To Apply",
      "Status",
    ];

    const rows = companies.map((c) => [
      c.companyName || c.name || "N/A",
      c.role || "N/A",
      c.jobType || "N/A",
      c.location || "N/A",
      c.package || "N/A",
      Array.isArray(c.eligibleCourses)
        ? c.eligibleCourses.join(", ")
        : c.eligibility || "N/A",
      c.arrivalDate
        ? new Date(c.arrivalDate).toLocaleDateString("en-GB")
        : "N/A",
      c.lastDateToApply
        ? new Date(c.lastDateToApply).toLocaleDateString("en-GB")
        : "N/A",
      c.status || "Upcoming",
    ]);

    const csvContent = [
      headers.join(","), // header row
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")), // data rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "upcoming_drives.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 pt-40 pb-12">
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Drives */}
            <Card className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Upcoming Drives</CardTitle>
                <Button className="gap-2 border-2 shadow-md" variant="ghost" size="sm" onClick={exportDrivesCsv}>
                  <Download className="w-4 h-4" />
                  Export CSV
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
                  const application = isApplied
                    ? myApplications.find(
                        (app) =>
                          (typeof app.companyId === "string"
                            ? app.companyId
                            : app.companyId?._id) === company._id,
                      )
                    : null;

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
                          <Badge variant="secondary">Applied</Badge>
                        ) : (
                          <ApplyJobDialog
                            job={{
                              _id: company._id,
                              company: companyName,
                              role: company.role,
                              date: company.arrivalDate,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
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

                <h3 className="font-bold text-lg">{user?.name || "Student"}</h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {user?.course || "Course not set"} • Final Year
                </p>

                <EditProfileDialog
                  trigger={
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  }
                  onProfileUpdate={fetchUser}
                />
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="flex gap-3 items-start pb-3 border-b border-border/50 last:border-0 last:pb-0"
                      >
                        <div
                          className={`w-2 h-2 mt-2 rounded-full ${n.type === "drive" ? "bg-blue-500" : "bg-green-500"}`}
                        />
                        <div>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {n.desc}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {n.date
                              ? new Date(n.date).toLocaleDateString()
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};;

export default StudentDashboard;
