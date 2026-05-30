import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon } from "lucide-react";
import api from "@/api/axios";

const ApplyJobDialog = ({ job, trigger }) => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);


  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidDriveLink = (url) => {
    return /^https:\/\/(drive\.google\.com)\//.test(url);
  };

  const getPreviewLink = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };


  const COURSE_DEPT_MAP = {
    BCA: "Computer Science",
    "BSc Computer Science": "Computer Science",
    "BTech CSE": "Computer Science",
    "BTech IT": "Information Technology",
    MCA: "Computer Science",
    MBA: "Management",
    BBA: "Management",
    BCom: "Commerce",
    BA: "Arts",
  };

  const COURSE_OPTIONS = [
    "BCA",
    "BSc Computer Science",
    "BTech CSE",
    "BTech IT",
    "MCA",
    "MBA",
    "BBA",
    "BCom",
    "BA",
    "Other",
  ];

  const DEPARTMENT_OPTIONS = [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Management",
    "Commerce",
    "Arts",
    "Science",
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    enrollmentNo: "",
    course: "",
    department: "",
    resumeLink: "",
  });

  // ✅ PREFILL ONLY LOGGED-IN STUDENT DATA
  useEffect(() => {
    if (user && open) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phone: "",
        enrollmentNo: user.enrollmentNo || "",
        course: user.course || "",
        department: user.department || "",
        resumeLink: "",
      });
      setPreviewUrl(null); // ✅ reset every time dialog opens
    }
  }, [user, open]);

 const handleChange = (e) => {
   const { id, value } = e.target;

   setFormData((prev) => {
     let updated = {
       ...prev,
       [id]: id === "enrollmentNo" ? value.toUpperCase() : value,
     };

     // ✅ Auto set department
     if (id === "course") {
       updated.department = COURSE_DEPT_MAP[value] || "";
     }
     if (id === "resumeLink") {
       const preview = getPreviewLink(value);
       setPreviewUrl(preview);
     }


     return updated;
   });
 };


const handleSubmit = (e) => {
  e.preventDefault();

  if (!job?._id) {
    toast.error("Invalid job. Please refresh.");
    return;
  }

  const link = formData.resumeLink.trim();

  if (!link) {
    toast.error("Please provide your resume drive link");
    return;
  }

  if (!isValidURL(link)) {
    toast.error("Enter a valid URL in resume link");
    return;
  }

  if (!isValidDriveLink(link)) {
    toast.error("Please enter a valid Google Drive link");
    return;
  }

  setShowConfirm(true);
};


  const handleConfirmApply = async () => {
    setLoading(true);

    try {
      const res = await api.post(
        `/applications/apply/${job._id}`,
        {
          company: job.companyName || job.company,
          role: job.role,
          ...formData,
        },
        { withCredentials: true }
      );

      toast.success(`Applied to ${job.companyName || job.company} successfully`);
      setOpen(false);
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Application failed"
      );
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button size="sm">Apply</Button>}
        </DialogTrigger>

        <DialogContent className="sm:max-w-[580px] sm:max-h-[620px] overflow-scroll">
          <DialogHeader>
            <DialogTitle>
              Apply to {job?.companyName || job?.company}
            </DialogTitle>
            <DialogDescription>
              Applying for <b>{job?.role}</b>
            </DialogDescription>
          </DialogHeader>
          <div className=" gap-5">
            <form onSubmit={handleSubmit} className="space-y-4 w-[100%]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Enrollment Number</Label>
                <Input
                  id="enrollmentNo"
                  value={formData.enrollmentNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Course</Label>
                <select
                  id="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select course</option>
                  {COURSE_OPTIONS.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Department</Label>
                <select
                  id="department"
                  value={formData.department}
                  disabled
                  className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                >
                  <option value="">
                    {formData.department || "Auto selected"}
                  </option>
                </select>
              </div>
              <div>
                {previewUrl ? (
                  <iframe src={previewUrl} className="w-full h-64" />
                ) : (
                  formData.resumeLink && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Invalid or unsupported link
                    </p>
                  )
                )}
              </div>
              <div>
                <Label>Resume Drive Link</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://drive.google.com/..."
                    id="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Review Application</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply for the <b>{job?.role}</b> role at{" "}
              <b>{job?.companyName || job?.company}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmApply();
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApplyJobDialog;
