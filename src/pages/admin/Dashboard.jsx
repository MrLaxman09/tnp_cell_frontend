import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";

const JOB_TYPE_OPTIONS = ["Full-time", "Internship", "Part-time", "Contract"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    placements: 0,
    avgPackage: 0,
    highestPackage: 0,
  });
  // console.log(stats.highestPackage)

  const [drives, setDrives] = useState([]);
  const [placements, setPlacements] = useState([]);

  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [isAddPlacementOpen, setIsAddPlacementOpen] = useState(false);

  const [editingDriveId, setEditingDriveId] = useState(null);

  const [newDrive, setNewDrive] = useState({
    name: "",
    logo: "",
    package: "",
    visitDate: "",
    lastDateToApply: "",
    posts: "",
    role: "",
    jobType: "Full-time",
    location: "",
    eligibility: "",
    status: "Upcoming",
    skills: "",
    jobDescription: "",
  });

  const [newPlacement, setNewPlacement] = useState({
    studentName: "",
    course: "",
    company: "",
    package: "",
    year: "",
    role: "",
    location: "",
    photo: "",
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
      const [studentRes, companyRes, placementRes, avgRes, highestRes] =
        await Promise.all([
          api.get("/students/count"),
          api.get("/companies"),
          api.get("/placements/count"),
          api.get("/placements/average-package"),
          api.get("/placements/highest-package"),
        ]);

      setStats({
        students: studentRes.data.count,
        companies: companyRes.data.count,
        placements: placementRes.data.count,
        avgPackage: avgRes.data.avgPackage || 0,
        highestPackage: highestRes.data.highestPackage || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setDrives(res.data.companies || []);
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
      name: "",
      logo: "",
      package: "",
      visitDate: "",
      lastDateToApply: "",
      posts: "",
      role: "",
      jobType: "Full-time",
      location: "",
      eligibility: "",
      status: "Upcoming",
      skills: "",
      jobDescription: "",
    });
    setIsAddDriveOpen(true);
  };

  // ===== OPEN EDIT DRIVE =====
  const handleEditDrive = (drive) => {
    setEditingDriveId(drive._id);
    setNewDrive({
      name: drive.name || "",
      logo: drive.logo || "",
      package: drive.package || "",
      visitDate: drive.visitDate || "",
      lastDateToApply: drive.lastDateToApply || "",
      posts: drive.posts || "",
      role: drive.role || "",
      jobType: drive.jobType || "Full-time",
      location: drive.location || "",
      eligibility: drive.eligibility || "",
      status: drive.status || "Upcoming",
      skills: drive.skills?.join(", ") || "",
      jobDescription: drive.jobDescription || "",
    });
    setIsAddDriveOpen(true);
  };

  // ===== ADD / UPDATE DRIVE =====
  const handleSaveDrive = async (e) => {
    e.preventDefault();

    const payload = {
      name: newDrive.name,
      logo: newDrive.logo,
      package: newDrive.package,
      visitDate: newDrive.visitDate,
      lastDateToApply: newDrive.lastDateToApply,
      posts: Number(newDrive.posts),
      role: newDrive.role,
      jobType: newDrive.jobType,
      location: newDrive.location,
      eligibility: newDrive.eligibility,
      status: newDrive.status,
      skills: newDrive.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      jobDescription: newDrive.jobDescription,
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

  // ===== ADD PLACEMENT (NOW WORKING) =====
  const handleAddPlacement = async (e) => {
    e.preventDefault();

    const payload = {
      studentName: newPlacement.studentName,
      course: newPlacement.course,
      company: newPlacement.company,
      package: Number(newPlacement.package),
      year: Number(newPlacement.year),
      role: newPlacement.role,
      location: newPlacement.location,
      photo: newPlacement.photo,
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
        role: "",
        location: "",
        photo: "",
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
      <div className="grid grid-cols-1 py-6 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-2 mb-8">
        {[
          { title: "Total Students", value: stats.students, icon: Users },
          {
            title: "Active Companies",
            value: stats.companies,
            icon: Building2,
          },
          { title: "Placements", value: stats.placements, icon: Briefcase },
          {
            title: "Highest. Package",
            value: `₹${stats.highestPackage.toFixed(0)} LPA`,
            icon: TrendingUp,
          },
          {
            title: "Avg. Package",
            value: `₹${stats.avgPackage.toFixed(0)} LPA`,
            icon: TrendingUp,
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
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
            <Button
              size="sm"
              type="button"
              onClick={() => setIsAddPlacementOpen(true)}
            >
              + Add Placement
            </Button>
          </CardHeader>

          <CardContent>
            {placements.length === 0 ? (
              <div className="text-center py-6">No placements found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {placements.slice(0, 4).map((p) => (
                  <Card key={p._id} className="overflow-hidden">
                    <img
                      src={
                        p.photo ||
                        "https://i.pinimg.com/736x/38/47/9c/38479c637a4ef9c5ced95ca66ffa2f41.jpg"
                      }
                      alt={p.studentName}
                      className="w-full h-40 object-cover"
                    />

                    <CardContent className="p-4 space-y-1">
                      <h3 className="font-semibold text-lg">{p.studentName}</h3>
                      <p className="text-sm font-medium">{p.company}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {p.role || "Software Engineer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Location: {p.location || "Bengaluru"}
                      </p>
                      <p className="font-semibold">Package: {p.package} LPA</p>
                      <Badge className="mt-2">{p.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Drives */}
        <Card>
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Upcoming Companies</CardTitle>
            <Button size="sm" type="button" onClick={handleOpenAddDrive}>
              + Add
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {drives.map((d) => (
              <div
                key={d._id}
                className="p-4 rounded-lg bg-secondary/50 border"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {d.visitDate || "Invalid Date"}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>{d.posts || 0} posts</span>
                  <span>{d.status || "Upcoming"}</span>
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

      {/* ===== ADD PLACEMENT MODAL (NEW — THIS MAKES BUTTON WORK) ===== */}
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
                  placeholder="Role"
                  value={newPlacement.role}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      role: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Location"
                  value={newPlacement.location}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      location: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Photo URL"
                  value={newPlacement.photo}
                  onChange={(e) =>
                    setNewPlacement({
                      ...newPlacement,
                      photo: e.target.value,
                    })
                  }
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

      {/* ===== ADD / EDIT DRIVE MODAL (UNCHANGED) ===== */}
      {isAddDriveOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-4">
            <CardHeader className="flex justify-between">
              <CardTitle>
                {editingDriveId ? "Edit Drive" : "Add Drive"}
              </CardTitle>
              <Button variant="ghost" onClick={() => setIsAddDriveOpen(false)}>
                <X />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveDrive} className="space-y-3">
                <Input
                  placeholder="Company Name"
                  value={newDrive.name}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, name: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Logo URL"
                  value={newDrive.logo}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, logo: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Package (e.g. 3.5 LPA)"
                  value={newDrive.package}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, package: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Visit Date"
                  value={newDrive.visitDate}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, visitDate: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Last Date to Apply"
                  value={newDrive.lastDateToApply}
                  onChange={(e) =>
                    setNewDrive({
                      ...newDrive,
                      lastDateToApply: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Posts"
                  type="number"
                  value={newDrive.posts}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, posts: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Role"
                  value={newDrive.role}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, role: e.target.value })
                  }
                  required
                />

                <select
                  className="w-full border rounded p-2"
                  value={newDrive.jobType}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, jobType: e.target.value })
                  }
                >
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Location"
                  value={newDrive.location}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, location: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Eligibility"
                  value={newDrive.eligibility}
                  onChange={(e) =>
                    setNewDrive({
                      ...newDrive,
                      eligibility: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Status (Upcoming/Ongoing/Done)"
                  value={newDrive.status}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, status: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Skills (comma separated)"
                  value={newDrive.skills}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, skills: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Job Description"
                  value={newDrive.jobDescription}
                  onChange={(e) =>
                    setNewDrive({
                      ...newDrive,
                      jobDescription: e.target.value,
                    })
                  }
                  required
                />

                <Button type="submit" className="w-full">
                  {editingDriveId ? "Update Drive" : "Add Drive"}
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
