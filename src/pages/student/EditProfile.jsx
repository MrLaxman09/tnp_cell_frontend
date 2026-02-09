import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import api from "@/api/axios";

const courseOptions = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Business Administration",
  "Commerce",
  "Arts",
  "Science",
  "Other",
];

const EditProfileDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enrollmentNo: "",
    course: "",
    currentPassword: "",
    newPassword: "",
  });

  // ===== FETCH LOGGED-IN USER WHEN DIALOG OPENS =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        const user = res.data.user;

        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          enrollmentNo: user?.enrollmentNo || "",
          course: user?.course || "",
          currentPassword: "",
          newPassword: "",
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    if (open) {
      fetchUser();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "enrollmentNo" ? value.toUpperCase() : value,
    }));
  };

  // ===== SUBMIT UPDATE =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      enrollmentNo: formData.enrollmentNo,
      course: formData.course,
    };

    if (formData.newPassword) {
      payload.password = formData.newPassword;
      payload.currentPassword = formData.currentPassword;
    }

    try {
      await api.put("/students/me", payload, {
        withCredentials: true,
      });

      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error.response?.data?.message || "Update failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Profile</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal details and password
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="text-center py-6">Loading profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Enrollment Number</Label>
              <Input
                name="enrollmentNo"
                value={formData.enrollmentNo}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Course</Label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select course</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-4 mt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Change Password (Optional)
              </p>

              <div>
                <Label>Current Password</Label>
                <Input
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label>New Password</Label>
                <Input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
