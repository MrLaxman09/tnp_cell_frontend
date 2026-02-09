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

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    logoUrl: "",
    arrivalDate: "",
    cgpaRequired: "",
    role: "",
    openings: "",
    location: "",
    jdUrl: "",
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
      companyName: "",
      logoUrl: "",
      arrivalDate: "",
      cgpaRequired: "",
      role: "",
      openings: "",
      location: "",
      jdUrl: "",
    });
    setIsAddOpen(true);
  };

  // ===== OPEN EDIT =====
  const handleEditClick = (company) => {
    setEditingId(company._id);
    setFormData({
      companyName: company.companyName,
      logoUrl: company.logoUrl || "",
      arrivalDate: company.arrivalDate?.slice(0, 10),
      cgpaRequired: company.cgpaRequired,
      role: company.role,
      openings: company.openings,
      location: company.location,
      jdUrl: company.jdUrl || "",
    });
    setIsAddOpen(true);
  };

  // ===== CREATE / UPDATE =====
  const handleSaveCompany = async (e) => {
    e.preventDefault();

    const payload = {
      companyName: formData.companyName,
      logoUrl: formData.logoUrl,
      arrivalDate: formData.arrivalDate,
      cgpaRequired: Number(formData.cgpaRequired),
      role: formData.role,
      openings: Number(formData.openings),
      location: formData.location,
      jdUrl: formData.jdUrl,
      registeredCount: 0,
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

  // ===== SEARCH FILTER =====
  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase())
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
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Criteria</TableHead>
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
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {company.companyName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {company.companyName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.openings} Openings
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{company.role}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(company.arrivalDate).toDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {company.location}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {company.cgpaRequired} CGPA
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">Upcoming</Badge>
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
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />

                <Input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalDate: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="CGPA Required"
                  value={formData.cgpaRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, cgpaRequired: e.target.value })
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

                <Input
                  placeholder="Openings"
                  type="number"
                  value={formData.openings}
                  onChange={(e) =>
                    setFormData({ ...formData, openings: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
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
              Delete "{companyToDelete?.companyName}" permanently?
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
