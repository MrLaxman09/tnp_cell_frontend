import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Calendar,
  X,
  Pencil,
  Trash2,
  Users,
  Download,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/api/axios";

const JOB_TYPE_OPTIONS = ["Full-time", "Internship", "Part-time", "Contract"];

// ✅ SAFE HELPER FUNCTION (NEW FIX)
const getFirstLetter = (text) => {
  if (!text || typeof text !== "string") return "?";
  return text.trim().charAt(0).toUpperCase() || "?";
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewApplicantsOpen, setViewApplicantsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Date Validations
  const today = new Date().toISOString().split("T")[0];
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [formData, setFormData] = useState({
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

  // ===== FETCH COMPANIES =====
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPEN ADD =====
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
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
    setIsAddOpen(true);
  };

  // ===== OPEN EDIT =====
  const handleEditClick = (company) => {
    setEditingId(company._id);
    setFormData({
      name: company.name || "",
      logo: company.logo || "",
      package: company.package || "",
      visitDate: company.visitDate || "",
      lastDateToApply: company.lastDateToApply || "",
      posts: company.posts || "",
      role: company.role || "",
      jobType: company.jobType || "Full-time",
      location: company.location || "",
      eligibility: company.eligibility || "",
      status: company.status || "Upcoming",
      skills: company.skills?.join(", ") || "",
      jobDescription: company.jobDescription || "",
    });
    setIsAddOpen(true);
  };

  // ===== CREATE / UPDATE =====
  const handleSaveCompany = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      logo: formData.logo,
      package: formData.package,
      visitDate: formData.visitDate,
      lastDateToApply: formData.lastDateToApply,
      posts: Number(formData.posts),
      role: formData.role,
      jobType: formData.jobType,
      location: formData.location,
      eligibility: formData.eligibility,
      status: formData.status,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      jobDescription: formData.jobDescription,
    };

    try {
      if (editingId) {
        await api.put(`/companies/${editingId}`, payload);
      } else {
        await api.post("/companies", payload);
      }

      setIsAddOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company. Check backend.");
    }
  };

  // ===== DELETE =====
  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      await api.delete(`/companies/${companyToDelete._id}`);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Delete failed.");
    }
  };

  // ===== VIEW APPLICANTS =====
  const handleViewApplicants = async (company) => {
    setSelectedCompany(company);
    setViewApplicantsOpen(true);
    setLoadingApplicants(true);
    setApplicants([]);

    try {
      const res = await api.get("/applications");
      const allApps = res.data.applications || [];
      const filtered = allApps.filter((app) => {
        const cId =
          typeof app.companyId === "object"
            ? app.companyId?._id
            : app.companyId;
        return cId === company._id;
      });
      setApplicants(filtered);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // ===== EXPORT APPLICANTS CSV =====
  const handleExportApplicants = () => {
    if (!applicants.length) return;

    const headers = [
      "Full Name",
      "Email",
      "Course",
      "Status",
      "Applied On",
      "Resume Link",
    ];

    const rows = applicants.map((app) => [
      app.fullName,
      app.email,
      app.course,
      app.status || "Pending",
      new Date(app.createdAt).toLocaleDateString(),
      app.resumeLink || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${selectedCompany?.name || "company"}_applicants.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ SAFE FILTER (NO CRASH)
  const filteredCompanies = companies.filter((c) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (c.name || "").toLowerCase().includes(searchText) ||
      (c.role || "").toLowerCase().includes(searchText) ||
      (c.location || "").toLowerCase().includes(searchText);

    const matchesYear =
      selectedYear === "all" ||
      new Date(c.visitDate).getFullYear().toString() === selectedYear;

    const matchesStatus =
      statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter;

    return matchesSearch && matchesYear && matchesStatus;
  });

  // ===== EXPORT COMPANIES TO CSV =====
  const exportCompaniesCsv = () => {
    if (!filteredCompanies.length) {
      alert("No companies to export.");
      return;
    }

    const headers = [
      "Company Name",
      "Role",
      "Job Type",
      "Location",
      "Package",
      "Posts",
      "Eligibility",
      "Status",
      "Visit Date",
      "Last Date To Apply",
      "Skills",
    ];

    const rows = filteredCompanies.map((c) => [
      c.name || "N/A",
      c.role || "N/A",
      c.jobType || "N/A",
      c.location || "N/A",
      c.package || "N/A",
      c.posts || "N/A",
      c.eligibility || "N/A",
      c.status || "N/A",
      c.visitDate ? new Date(c.visitDate).toLocaleDateString("en-GB") : "N/A",
      c.lastDateToApply
        ? new Date(c.lastDateToApply).toLocaleDateString("en-GB")
        : "N/A",
      Array.isArray(c.skills) ? c.skills.join(", ") : c.skills || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "companies.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage recruitment drives (Live Backend Data)
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddNew}>
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
        <Button className="gap-2" onClick={exportCompaniesCsv}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 ">
        {/* Search */}
        <div className="flex-1 ">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground " />
            <Input
              placeholder="Search companies..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Year Filter */}
          <select
            className="border rounded-md px-3 h-10 text-sm bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Status Filter */}
          <select
            className="border rounded-md px-3 h-10 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {getFirstLetter(company.name)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {company.name || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.posts || 0} Posts
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{company.role || "—"}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {company.visitDate || "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {company.location || "—"}
                        </div>
                      </TableCell>

                      <TableCell>{company.posts || 0}</TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {company.status || "Upcoming"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewApplicants(company)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              View Applicants
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(company)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCompanyToDelete(company)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <Card className="w-full max-w-lg p-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between">
              <CardTitle>
                {editingId ? "Edit Company" : "Add Company"}
              </CardTitle>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                <X />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-3">
                <Input
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <div className="flex items-center justify-center gap-3">
                  <Input
                    placeholder="Logo URL"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({ ...formData, logo: e.target.value })
                    }
                    required
                  />

                  {/* ✅ Preview */}
                  {formData.logo && (
                    <div className="">
                      <img
                        src={formData.logo}
                        alt="Logo Preview"
                        className="w-[60px] object-cover rounded-md border"
                        onError={(e) => (e.target.style.display = "none")} // ❌ invalid link hide
                      />
                    </div>
                  )}
                </div>

                <Input
                  placeholder="Package (e.g. 3.5 LPA)"
                  value={formData.package}
                  onChange={(e) =>
                    setFormData({ ...formData, package: e.target.value })
                  }
                  required
                />

                {/* Visit Date */}
                <div>
                  <Input
                    type={formData.visitDate ? "date" : "text"}
                    placeholder="Select Visit Date (e.g. 30 Apr 2026)"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!formData.visitDate) e.target.type = "text";
                    }}
                    min={today} // ❌ past block
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                    required
                  />

                  {/* Preview formatted */}
                  {formData.visitDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Visit Date of Company Selected:{" "}
                      <strong>{formatDate(formData.visitDate)}</strong>
                    </p>
                  )}
                </div>

                {/* Last Date to Apply */}
                <div>
                  <Input
                    type={formData.visitDate ? "date" : "text"}
                    placeholder="Select Visit Date (e.g. 30 Apr 2026)"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!formData.visitDate) e.target.type = "text";
                    }}
                    min={today}
                    max={formData.visitDate} // 👈 important
                    value={formData.lastDateToApply}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastDateToApply: e.target.value,
                      })
                    }
                    required
                  />

                  {formData.lastDateToApply && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Last Date To Apply Selected:{" "}
                      <strong>{formatDate(formData.lastDateToApply)}</strong>
                    </p>
                  )}
                </div>

                <Input
                  placeholder="Posts"
                  type="number"
                  value={formData.posts}
                  onChange={(e) =>
                    setFormData({ ...formData, posts: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                />

                <select
                  className="w-full border rounded p-2"
                  value={formData.jobType}
                  onChange={(e) =>
                    setFormData({ ...formData, jobType: e.target.value })
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
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Eligibility"
                  value={formData.eligibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibility: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Status (Upcoming/Ongoing/Done)"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Skills (comma separated)"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Job Description"
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobDescription: e.target.value,
                    })
                  }
                  required
                />

                <Button type="submit" className="w-full">
                  {editingId ? "Update Company" : "Add Company"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={!!companyToDelete}
        onOpenChange={(open) => !open && setCompanyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{companyToDelete?.name}" permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* VIEW APPLICANTS DIALOG */}
      <Dialog open={viewApplicantsOpen} onOpenChange={setViewApplicantsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicants for {selectedCompany?.name}</DialogTitle>
          </DialogHeader>

          {applicants.length > 0 && !loadingApplicants && (
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportApplicants}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}

          {loadingApplicants ? (
            <div className="text-center py-8">Loading applicants...</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students have applied to this company yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Resume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-medium">
                      {app.fullName}
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.course}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.status || "Pending"}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {app.resumeLink ? (
                        <a
                          href={app.resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};;

export default AdminCompanies;
