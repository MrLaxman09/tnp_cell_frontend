import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/api/axios";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    enrollmentNo: "",
    course: "",
    password: "",
  });

  // ===== FETCH STUDENTS =====
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPEN ADD MODAL =====
  const handleAddClick = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      enrollmentNo: "",
      course: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  // ===== OPEN EDIT MODAL =====
  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      email: student.email,
      enrollmentNo: student.enrollmentNo,
      course: student.course,
      password: "",
    });
    setIsModalOpen(true);
  };

  // ===== ADD / UPDATE STUDENT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // UPDATE
        await api.put(`/students/${editingId}`, {
          name: form.name,
          email: form.email,
          enrollmentNo: form.enrollmentNo,
          course: form.course,
        });
      } else {
        // CREATE (ADMIN ADD)
        await api.post("/students", {
          name: form.name,
          email: form.email,
          enrollmentNo: form.enrollmentNo,
          course: form.course,
          password: form.password || "student@123",
        });
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Operation failed. Check backend.");
    }
  };

  // ===== DELETE STUDENT =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Delete failed.");
    }
  };

  // ===== SEARCH FILTER =====
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.enrollmentNo || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage real registered students
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddClick}>
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* SEARCH */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
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
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{student.name}</div>
                        </div>
                      </TableCell>

                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrollmentNo}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        {new Date(student.createdAt).toDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(student._id)}
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
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md p-4">
            <CardHeader className="flex justify-between">
              <CardTitle>
                {editingId ? "Edit Student" : "Add Student"}
              </CardTitle>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                <X />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Enrollment No"
                  value={form.enrollmentNo}
                  onChange={(e) =>
                    setForm({ ...form, enrollmentNo: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Course"
                  value={form.course}
                  onChange={(e) =>
                    setForm({ ...form, course: e.target.value })
                  }
                  required
                />

                {!editingId && (
                  <Input
                    placeholder="Temporary Password (optional)"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                )}

                <Button type="submit" className="w-full">
                  {editingId ? "Update Student" : "Add Student"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Students;
