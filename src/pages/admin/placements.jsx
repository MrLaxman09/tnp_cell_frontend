import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Download,
  X,
  Edit,
  Trash2
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
import api from "@/api/axios";

const AdminPlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [placementToDelete, setPlacementToDelete] = useState(null);

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

  // ===== SEARCH FILTER =====
  const filteredPlacements = placements.filter((p) =>
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.company.toLowerCase().includes(search.toLowerCase())
  );

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
      </div>

      {/* SEARCH */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or company..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* CARD GRID */}
      {loading ? (
        <div className="text-center p-6">Loading...</div>
      ) : filteredPlacements.length === 0 ? (
        <div className="text-center p-6">No placements found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlacements.map((p) => (
            <Card key={p._id} className="overflow-hidden">
              <img
                src={
                  p.photo ||
                  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60"
                }
                alt={p.studentName}
                className="w-full h-48 object-cover"
              />

              <CardHeader>
                <CardTitle>{p.studentName}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="font-medium">{p.company}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {p.role || "Software Engineer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Location: {p.location || "Bengaluru"}
                </p>
                <p className="font-semibold">
                  Package: {p.package} LPA
                </p>
                <p className="text-sm text-muted-foreground">
                  Year: {p.year}
                </p>

                <div className="flex gap-2 mt-3">
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
            <CardHeader className="flex justify-between">
              <CardTitle>
                {editingId ? "Edit Placement" : "Add Placement"}
              </CardTitle>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                <X />
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
        onOpenChange={(open) =>
          !open && setPlacementToDelete(null)
        }
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
    </div>
  );
};

export default AdminPlacements;
