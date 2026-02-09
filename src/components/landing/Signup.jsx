import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/landing/Header";
import api from "@/api/axios";

const Signup = () => {
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    enrollmentNo: "",
    course: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateEnrollmentNo = (enrollmentNo) => {
    const regex = /^[0-9A-Z]+$/;
    return regex.test(enrollmentNo) && enrollmentNo.length >= 12;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!signupData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!signupData.email.trim())
      newErrors.email = "Email is required";
    else if (!validateEmail(signupData.email))
      newErrors.email = "Invalid email";

    if (!signupData.enrollmentNo.trim())
      newErrors.enrollmentNo = "Enrollment number is required";
    else if (!validateEnrollmentNo(signupData.enrollmentNo))
      newErrors.enrollmentNo =
        "Format example: 006BCA23GT018 (CAPITAL LETTERS ONLY)";

    if (!signupData.course)
      newErrors.course = "Please select a course";

    if (!signupData.password)
      newErrors.password = "Password is required";
    else if (signupData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    if (!signupData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (signupData.password !== signupData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const newValue =
      name === "enrollmentNo" ? value.toUpperCase() : value;

    setSignupData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        name: signupData.fullName,
        email: signupData.email,
        enrollmentNo: signupData.enrollmentNo,
        course: signupData.course,
        password: signupData.password,
      });

      setSubmissionSuccess(true);

      setSignupData({
        fullName: "",
        email: "",
        enrollmentNo: "",
        course: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setSubmissionError(
        error.response?.data?.error || "Signup failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-card p-8">
            {submissionSuccess && (
              <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Account created successfully!
                  </p>
                  <p className="text-xs text-green-600">
                    Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {submissionError && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Signup failed
                  </p>
                  <p className="text-xs text-red-600">
                    {submissionError}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={signupData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName}</p>
              )}

              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}

              <Input
                name="enrollmentNo"
                placeholder="Example: 006BCA23GT018"
                value={signupData.enrollmentNo}
                onChange={handleInputChange}
              />
              {errors.enrollmentNo && (
                <p className="text-xs text-red-600">
                  {errors.enrollmentNo}
                </p>
              )}

              <select
                name="course"
                value={signupData.course}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select course</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {errors.course && (
                <p className="text-xs text-red-600">{errors.course}</p>
              )}

              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={handleInputChange}
              />

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
