import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Download,
  X,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const AdminPlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [placementToDelete, setPlacementToDelete] = useState(null);
  const [viewPlacement, setViewPlacement] = useState(null);

  const [newPlacement, setNewPlacement] = useState({
    studentName: "",
    course: "",
    company: "",
    package: "",
    year: "",
    location: "",
    role: "",
    photo: "",
  });

  // ===== FETCH PLACEMENTS =====
  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const res = await api.get("/placements");
      setPlacements(res.data.placements || []);
    } catch (error) {
      console.error("Error fetching placements:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPEN ADD =====
  const handleAddNew = () => {
    setEditingId(null);
    setNewPlacement({
      studentName: "",
      course: "",
      company: "",
      package: "",
      year: "",
      location: "",
      role: "",
      photo: "",
    });
    setIsAddOpen(true);
  };

  // ===== OPEN EDIT =====
  const handleEdit = (placement) => {
    setEditingId(placement._id);
    setNewPlacement({
      studentName: placement.studentName,
      course: placement.course,
      company: placement.company,
      package: placement.package,
      year: placement.year,
      location: placement.location || "",
      role: placement.role || "",
      photo: placement.photo || "",
    });
    setIsAddOpen(true);
  };

  // ===== ADD / UPDATE PLACEMENT =====
  const handleSavePlacement = async (e) => {
    e.preventDefault();

    const payload = {
      studentName: newPlacement.studentName,
      course: newPlacement.course,
      company: newPlacement.company,
      package: Number(newPlacement.package),
      year: Number(newPlacement.year),
      status: "Confirmed",
      location: newPlacement.location,
      role: newPlacement.role,
      photo: newPlacement.photo,
    };

    try {
      if (editingId) {
        await api.put(`/placements/update/${editingId}`, payload);
      } else {
        await api.post("/placements", payload);
      }

      setIsAddOpen(false);
      fetchPlacements();
    } catch (error) {
      console.error("Error saving placement:", error);
      alert("Failed to save placement. Check backend.");
    }
  };

  // ===== DELETE PLACEMENT =====
  const handleConfirmDelete = async () => {
    if (!placementToDelete) return;

    try {
      await api.delete(`/placements/delete/${placementToDelete._id}`);
      setPlacementToDelete(null);
      fetchPlacements();
    } catch (error) {
      console.error("Error deleting placement:", error);
      alert("Delete failed.");
    }
  };

  // ===== EXPORT PLACEMENTS TO CSV =====
  const exportPlacementCsv = () => {
    if (!filteredPlacements.length) {
      alert("No placements to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Course",
      "Company",
      "Role",
      "Package",
      "Year",
      "Location",
      "Status",
    ];

    const rows = filteredPlacements.map((p) => [
      p.studentName || "N/A",
      p.course || "N/A",
      p.company || "N/A",
      p.role || "N/A",
      p.package || "N/A",
      p.year || "N/A",
      p.location || "N/A",
      p.status || "Confirmed",
    ]);

    const csvContent = [
      headers.join(","), // header row
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")), // data rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "placements.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== SEARCH FILTER =====
  const filteredPlacements = placements.filter((p) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (p.studentName || "").toLowerCase().includes(searchText) ||
      (p.company || "").toLowerCase().includes(searchText) ||
      (p.role || "").toLowerCase().includes(searchText) ||
      (p.location || "").toLowerCase().includes(searchText);

    const matchesYear = !yearFilter || p.year?.toString().includes(yearFilter);

    return matchesSearch && matchesYear;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Placements</h1>
          <p className="text-muted-foreground">
            Manage student placements and offers
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddNew}>
          <Plus className="w-4 h-4" />
          Add Placement
        </Button>
        <Button className="gap-2" onClick={exportPlacementCsv}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 items-center mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search placements..."
            className="pl-10 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Year Input */}
        <Input
          type="number"
          placeholder="Year"
          className="h-10 w-28"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="text-center p-6">Loading...</div>
      ) : filteredPlacements.length === 0 ? (
        <div className="text-center p-6">No placements found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPlacements.map((p) => (
            <Card key={p._id} className="overflow-hidden flex p-2">
              <div>
                <img
                  src={
                    p.photo ||
                    "https://i.pinimg.com/736x/38/47/9c/38479c637a4ef9c5ced95ca66ffa2f41.jpg"
                  }
                  alt={p.studentName}
                  className="md:w-48 md:h-48 mx-auto object-contain shadow-md shadow-green-600 md:rounded-full"
                />

                <CardHeader>
                  <p className="md:text-xl">{p.studentName}</p>
                </CardHeader>
              </div>

              <CardContent className="space-y-2">
                <p className="font-medium">{p.company}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {p.role || "Software Engineer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Location: {p.location || "Bengaluru"}
                </p>
                <p className="font-semibold">Package: {p.package} LPA</p>
                <p className="text-sm text-muted-foreground">Year: {p.year}</p>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewPlacement(p)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(p)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPlacementToDelete(p)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingId ? "Edit Placement" : "Add Placement"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsAddOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePlacement} className="space-y-3">
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
                  placeholder="Course (e.g. B.Tech / MCA)"
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
                  {editingId ? "Update Placement" : "Add Placement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={!!placementToDelete}
        onOpenChange={(open) => !open && setPlacementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this placement record?
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

      {/* VIEW DETAILS DIALOG */}
      <Dialog
        open={!!viewPlacement}
        onOpenChange={(open) => !open && setViewPlacement(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Placement Details</DialogTitle>
          </DialogHeader>

          {viewPlacement && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-4">
                <img
                  src={
                    viewPlacement.photo ||
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60"
                  }
                  alt={viewPlacement.studentName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Student Name
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.studentName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Course
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.course}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Company
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.company}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Package
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.package} LPA
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Role
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.role || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm font-semibold">
                    {viewPlacement.location || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Year
                  </p>
                  <p className="text-sm font-semibold">{viewPlacement.year}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};;

export default AdminPlacements;
