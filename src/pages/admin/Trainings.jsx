import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  X,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/api/axios";

const STATUS_OPTIONS = ["Upcoming", "Ongoing", "Completed"];
const CATEGORY_OPTIONS = [
  "Training",
  "Webinar",
  "Internship",
  "Workshop",
  "Talks & Seminars",
];

const PLATFORM_OPTIONS = ["Zoom", "Google Meet", "MS Teams", "YouTube Live", "Other"];

const AdminTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Training",
    department: "",
    instructor: "",
    date: "",
    duration: "",
    status: "Upcoming",
    platform: "",
    meetingLink: "",
  });

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ===== FETCH PROGRAMS FROM BACKEND =====
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await api.get("/trainings");
        setTrainings(res.data.trainings || []);
      } catch (error) {
        console.error("Fetch trainings error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  // ===== CREATE / UPDATE =====
  const handleSaveTraining = async (e) => {
    e.preventDefault();

    const payload = { ...formData };

    try {
      if (editingId) {
        const res = await api.put(`/trainings/${editingId}`, payload);
        setTrainings(
          trainings.map((t) =>
            t._id === editingId ? res.data.training : t
          )
        );
      } else {
        const res = await api.post("/trainings", payload);
        setTrainings([res.data.training, ...trainings]);
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        category: "Training",
        department: "",
        instructor: "",
        date: "",
        duration: "",
        status: "Upcoming",
        platform: "",
        meetingLink: "",
      });
    } catch (error) {
      console.error("Save training error:", error);
      alert("Failed to save. Check backend.");
    }
  };

  // ===== EDIT =====
  const handleEdit = (training) => {
    setFormData({
      title: training.title || "",
      category: training.category || "Training",
      department: training.department || "",
      instructor: training.instructor || "",
      date: training.date?.split("T")[0] || "",
      duration: training.duration || "",
      status: training.status || "Upcoming",
      platform: training.platform || "",
      meetingLink: training.meetingLink || "",
    });
    setEditingId(training._id);
    setIsFormOpen(true);
  };

  // ===== DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/trainings/${id}`);
      setTrainings(trainings.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  // ===== ADD NEW =====
  const handleAddNew = () => {
    setFormData({
      title: "",
      category: "Training",
      department: "",
      instructor: "",
      date: "",
      duration: "",
      status: "Upcoming",
      platform: "",
      meetingLink: "",
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  // ===== EXPORT CSV =====
  const handleExport = () => {
    const headers = [
      "Title",
      "Category",
      "Department",
      "Instructor",
      "Date",
      "Duration",
      "Status",
      "Platform",
      "Meeting Link",
    ];

    const csvContent = [
      headers.join(","),
      ...trainings.map((t) =>
        [
          t.title,
          t.category,
          t.department,
          t.instructor,
          t.date,
          t.duration,
          t.status,
          t.platform || "N/A",
          t.meetingLink || "N/A",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "programs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== SEARCH =====
  const filteredTrainings = trainings.filter((t) => {
    const searchText = search.toLowerCase();

    return Object.values({
      title: t.title,
      category: t.category,
      department: t.department,
      instructor: t.instructor,
      date: t.date,
      duration: t.duration,
      status: t.status,
      platform: t.platform,
      meetingLink: t.meetingLink,
    }).some((value) =>
      (value || "").toString().toLowerCase().includes(searchText),
    );
  });


  // ===== PAGINATION =====
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrainings = filteredTrainings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);

  if (loading) {
    return <div className="text-center mt-10">Loading programs...</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Programs (TN&P)
          </h1>
          <p className="text-muted-foreground">
            Manage Trainings, Webinars, Internships, Workshops & Talks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="gap-2" onClick={handleAddNew}>
            <Plus className="w-4 h-4" />
            Add Program
          </Button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="border border-border mb-6">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Taken By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTrainings.map((training) => (
                <TableRow key={training._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      {training.title}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge>{training.category || "Training"}</Badge>
                  </TableCell>

                  <TableCell>{training.department}</TableCell>
                  <TableCell>{training.instructor}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {training.date?.split("T")[0]}
                    </div>
                  </TableCell>

                  <TableCell>{training.duration}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        training.status === "Upcoming"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {training.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{training.platform || "N/A"}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(training)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(training._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-4">
            <Card className="border border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {editingId ? "Edit Program" : "Add New Program"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFormOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSaveTraining} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  {/* CATEGORY DROPDOWN */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full border rounded p-2"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SHOW PLATFORM + LINK ONLY IF WEBINAR */}
                  {formData.category === "Webinar" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Platform
                        </label>
                        <select
                          className="w-full border rounded p-2"
                          value={formData.platform}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              platform: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Platform</option>
                          {PLATFORM_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Meeting Link
                        </label>
                        <Input
                          placeholder="https://..."
                          value={formData.meetingLink}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meetingLink: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Department
                      </label>
                      <Input
                        required
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Taken By
                      </label>
                      <Input
                        required
                        value={formData.instructor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instructor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Duration
                      </label>
                      <Input
                        required
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* STATUS DROPDOWN */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="w-full border rounded p-2"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingId ? "Save Changes" : "Add Program"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainings;
