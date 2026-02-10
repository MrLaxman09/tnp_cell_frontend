import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search, MoreVertical, Trash2 } from "lucide-react";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";

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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data.applications || []);
    } catch (error) {
      console.error("Failed to load applications", error);
    }
  };

  /* ===== DELETE (FIXED) ===== */
  const deleteApplication = async () => {
    if (!deleteItem?._id) return;

    try {
      await api.delete(`/applications/${deleteItem._id}`);
      setDeleteItem(null);
      fetchApplications();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete application");
    }
  };

  /* ===== SEARCH FILTER ===== */
  const filteredApplications = applications.filter((a) =>
    `${a.fullName} ${a.email} ${a.company} ${a.role} ${a.course} ${a.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ===== EXPORT CSV ===== */
  const exportCSV = () => {
    const headers = [
      "Student",
      "Email",
      "Company",
      "Role",
      "Course",
      "Department",
      "Applied On",
      "Resume",
    ];

    const rows = filteredApplications.map((a) => [
      a.fullName,
      a.email,
      a.company,
      a.role,
      a.course,
      a.department,
      new Date(a.createdAt).toLocaleDateString(),
      a.resumeLink,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "applications.csv";
    link.click();
  };

  return (
    <div className="p-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Applications</h1>
          <p className="text-muted-foreground">
            View and manage student job applications
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* SEARCH BAR */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, email, company, role, course..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Applications List</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.fullName}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>{app.course}</TableCell>
                    <TableCell>{app.department}</TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(app.resumeLink, "_blank")}
                      >
                        View Resume
                      </Button>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteItem(app)}
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
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteItem}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={deleteApplication}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Applications;
