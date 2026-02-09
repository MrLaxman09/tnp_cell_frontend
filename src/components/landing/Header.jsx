import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, User, LogOut, ArrowLeft } from "lucide-react";
import api from "@/api/axios";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDashboard =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/admin");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const getDashboardPath = () => {
    if (!user?.role) return "/login";
    return user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">T&P Cell</p>
            <p className="text-xs text-muted-foreground">University Portal</p>
          </div>
        </Link>

        {/* HOME NAV ONLY */}
        {!isDashboard && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm hover:text-foreground">
              About
            </a>
            <a href="#companies" className="text-sm hover:text-foreground">
              Companies
            </a>
            <a href="#trainings" className="text-sm hover:text-foreground">
              Trainings
            </a>
            <a href="#highlights" className="text-sm hover:text-foreground">
              Highlights
            </a>
            <a href="#contact" className="text-sm hover:text-foreground">
              Contact
            </a>
          </nav>
        )}

        {/* 🔥 HIGHLIGHTED BACK TO HOME */}
        {isDashboard && (
          <Button
            size="sm"
            className="
              gap-2 
              bg-primary 
              text-primary-foreground 
              hover:bg-primary/90 
              shadow-md
              transition-all
            "
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to Home
          </Button>
        )}

        {/* USER ACTIONS */}
        <div className="flex items-center gap-4">
          {!loading && !user && (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}

          {!loading && user && (
            <>
              <span className="text-sm font-medium">Hi, {user.name}</span>

              {!isDashboard && (
                <Link to={getDashboardPath()}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
