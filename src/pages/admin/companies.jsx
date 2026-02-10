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

  // ✅ SAFE FILTER (NO CRASH)
  const filteredCompanies = companies.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

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
      </div>

      {/* SEARCH */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-4">
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

                <Input
                  placeholder="Logo URL"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Package (e.g. 3.5 LPA)"
                  value={formData.package}
                  onChange={(e) =>
                    setFormData({ ...formData, package: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Visit Date (e.g. 20 Feb 2026)"
                  value={formData.visitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, visitDate: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Last Date to Apply"
                  value={formData.lastDateToApply}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastDateToApply: e.target.value,
                    })
                  }
                  required
                />

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
    </div>
  );
};

export default AdminCompanies;
