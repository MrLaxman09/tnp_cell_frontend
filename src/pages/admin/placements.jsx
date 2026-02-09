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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [placementToDelete, setPlacementToDelete] = useState(null);

  const [newPlacement, setNewPlacement] = useState({
    studentName: "",
    course: "",
    company: "",
    package: "",
    year: "",
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

  // ===== EXPORT CSV =====
  const handleExport = () => {
    const headers = ["Student Name", "Course", "Company", "Package", "Year"];

    const csvContent = [
      headers.join(","),
      ...placements.map((p) =>
        [
          p.studentName,
          p.course,
          p.company,
          `${p.package} LPA`,
          p.year,
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "placements.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Placements</h1>
          <p className="text-muted-foreground">
            Manage student placements and offers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="gap-2" onClick={handleAddNew}>
            <Plus className="w-4 h-4" />
            Add Placement
          </Button>
        </div>
      </div>

      <Card className="border border-border mb-6">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search placements..."
              className="pl-10 h-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No placements found
                    </TableCell>
                  </TableRow>
                ) : (
                  placements.map((placement) => (
                    <TableRow key={placement._id}>
                      <TableCell>{placement.studentName}</TableCell>
                      <TableCell>{placement.course}</TableCell>
                      <TableCell>{placement.company}</TableCell>
                      <TableCell>{placement.package} LPA</TableCell>
                      <TableCell>{placement.year}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(placement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              setPlacementToDelete(placement)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
