import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Plus,
  X,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    placements: 0,
    avgPackage: 0,
  });

  const [drives, setDrives] = useState([]);
  const [placements, setPlacements] = useState([]);

  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [isAddPlacementOpen, setIsAddPlacementOpen] = useState(false);

  const [editingDriveId, setEditingDriveId] = useState(null);

  const [newDrive, setNewDrive] = useState({
    companyName: "",
    logoUrl: "",
    arrivalDate: "",
    cgpaRequired: "",
    role: "",
    openings: "",
    location: "",
    jdUrl: "",
  });

  const [newPlacement, setNewPlacement] = useState({
    studentName: "",
    course: "",
    company: "",
    package: "",
    year: "",
    status: "Confirmed",
  });

  // ===== FETCH ALL DATA =====
  useEffect(() => {
    fetchDashboardData();
    fetchCompanies();
    fetchPlacements();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentRes, companyRes, placementRes, avgRes] =
        await Promise.all([
          api.get("/students/count"),
          api.get("/companies"),
          api.get("/placements/count"),
          api.get("/placements/average-package"),
        ]);

      setStats({
        students: studentRes.data.count,
        companies: companyRes.data.count,
        placements: placementRes.data.count,
        avgPackage: avgRes.data.avgPackage || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setDrives(res.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchPlacements = async () => {
    try {
      const res = await api.get("/placements");
      setPlacements(res.data.placements || []);
    } catch (error) {
      console.error("Error fetching placements:", error);
    }
  };

  // ===== OPEN ADD DRIVE =====
  const handleOpenAddDrive = () => {
    setEditingDriveId(null);
    setNewDrive({
      companyName: "",
      logoUrl: "",
      arrivalDate: "",
      cgpaRequired: "",
      role: "",
      openings: "",
      location: "",
      jdUrl: "",
    });
    setIsAddDriveOpen(true);
  };

  // ===== OPEN EDIT DRIVE =====
  const handleEditDrive = (drive) => {
    setEditingDriveId(drive._id);
    setNewDrive({
      companyName: drive.companyName,
      logoUrl: drive.logoUrl || "",
      arrivalDate: drive.arrivalDate?.slice(0, 10),
      cgpaRequired: drive.cgpaRequired,
      role: drive.role,
      openings: drive.openings,
      location: drive.location,
      jdUrl: drive.jdUrl || "",
    });
    setIsAddDriveOpen(true);
  };

  // ===== ADD / UPDATE DRIVE =====
  const handleSaveDrive = async (e) => {
    e.preventDefault();

    const payload = {
      companyName: newDrive.companyName,
      logoUrl: newDrive.logoUrl,
      arrivalDate: newDrive.arrivalDate,
      cgpaRequired: Number(newDrive.cgpaRequired),
      role: newDrive.role,
      openings: Number(newDrive.openings),
      location: newDrive.location,
      jdUrl: newDrive.jdUrl,
      registeredCount: 0,
    };

    try {
      if (editingDriveId) {
        await api.put(`/companies/${editingDriveId}`, payload);
      } else {
        await api.post("/companies", payload);
      }

      setIsAddDriveOpen(false);
      fetchCompanies();
      fetchDashboardData();
    } catch (error) {
      console.error("Error saving drive:", error);
      alert("Failed to save drive. Check backend.");
    }
  };

  // ===== DELETE DRIVE =====
  const handleDeleteDrive = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) return;

    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting drive:", error);
      alert("Delete failed.");
    }
  };

  // ===== ADD PLACEMENT =====
  const handleAddPlacement = async (e) => {
    e.preventDefault();

    const payload = {
      studentName: newPlacement.studentName,
      course: newPlacement.course,
      company: newPlacement.company,
      package: Number(newPlacement.package),
      year: Number(newPlacement.year),
      status: "Confirmed",
    };

    try {
      await api.post("/placements", payload);

      setIsAddPlacementOpen(false);
      fetchPlacements();
      fetchDashboardData();

      setNewPlacement({
        studentName: "",
        course: "",
        company: "",
        package: "",
        year: "",
        status: "Confirmed",
      });
    } catch (error) {
      console.error("Error adding placement:", error);
      alert("Failed to add placement. Check backend.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time analytics from your database.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Students",
            value: stats.students,
            icon: Users,
          },
          {
            title: "Active Companies",
            value: stats.companies,
            icon: Building2,
          },
          {
            title: "Placements",
            value: stats.placements,
            icon: Briefcase,
          },
          {
            title: "Avg. Package",
            value: `₹${stats.avgPackage.toFixed(1)} LPA`,
            icon: TrendingUp,
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Placements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Recent Placements</CardTitle>
            <Button size="sm" onClick={() => setIsAddPlacementOpen(true)}>
              + Add Placement
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No placements found
                    </TableCell>
                  </TableRow>
                ) : (
                  placements.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.studentName || "N/A"}</TableCell>
                      <TableCell>{p.company || "N/A"}</TableCell>
                      <TableCell>{p.package} LPA</TableCell>
                      <TableCell>{p.year}</TableCell>
                      <TableCell>
                        <Badge>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Drives */}
        <Card>
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Upcoming Drives</CardTitle>
            <Button size="sm" onClick={handleOpenAddDrive}>
              + Add Drive
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {drives.map((d) => (
              <div
                key={d._id}
                className="p-4 rounded-lg bg-secondary/50 border"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{d.companyName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(d.arrivalDate).toDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>{d.openings} openings</span>
                  <span>{d.registeredCount || 0} registered</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDrive(d)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDrive(d._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ADD PLACEMENT MODAL */}
      {isAddPlacementOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-4">
            <CardHeader className="flex justify-between">
              <CardTitle>Add Placement</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setIsAddPlacementOpen(false)}
              >
                <X />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPlacement} className="space-y-3">
                <Input
                  placeholder="Student Name"
                  value={newPlacement.studentName}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      studentName: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Course (e.g. MCA / B.Tech)"
                  value={newPlacement.course}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      course: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Company Name"
                  value={newPlacement.company}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      company: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Package (LPA)"
                  type="number"
                  value={newPlacement.package}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      package: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Year (e.g. 2026)"
                  type="number"
                  value={newPlacement.year}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      year: e.target.value,
                    })
                  }
                  required
                />

                <Button type="submit" className="w-full">
                  Add Placement
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
