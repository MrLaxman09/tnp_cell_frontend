import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GraduationCap, User, LogOut, ArrowLeft, Menu, X } from "lucide-react";
import api from "@/api/axios";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/admin");

  useEffect(() => {
    const fetchUser = async () => {
      // Optimization: Don't fetch if we don't have a login flag
      if (!localStorage.getItem("logged_in")) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        console.log("Auth check failed (session expired or invalid):", error);
        setUser(null);
        localStorage.removeItem("logged_in"); // Session expired or invalid
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
      localStorage.removeItem("logged_in");
      navigate("/login");
    }
  };

  const getDashboardPath = () => {
    if (!user?.role) return "/login";
    return user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
  };

  // Navigation links for mobile menu
  const navLinks = (
    <>
      <a 
        href="#about" 
        className="text-sm hover:text-foreground py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        About
      </a>
      <a 
        href="#companies" 
        className="text-sm hover:text-foreground py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Companies
      </a>
      <a 
        href="#trainings" 
        className="text-sm hover:text-foreground py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Trainings
      </a>
      <a 
        href="#highlights" 
        className="text-sm hover:text-foreground py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Highlights
      </a>
      <a 
        href="#contact" 
        className="text-sm hover:text-foreground py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Contact
      </a>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold">T&P Cell</p>
            <p className="text-xs text-muted-foreground">University Portal</p>
          </div>
        </Link>

        {/* HOME NAV - Desktop */}
        {!isDashboard && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-base hover:text-foreground">
              About
            </a>
            <a href="#companies" className="text-base hover:text-foreground">
              Companies
            </a>
            <a href="#trainings" className="text-base hover:text-foreground">
              Trainings
            </a>
            <a href="#highlights" className="text-base hover:text-foreground">
              Highlights
            </a>
            <a href="#contact" className="text-base hover:text-foreground">
              Contact
            </a>
          </nav>
        )}

        {/* HOME NAV - Mobile */}
        {!isDashboard && (
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation links
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-4">
                    {navLinks}
                  </div>
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    {!loading && !user && (
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Login</Button>
                      </Link>
                    )}
                    {!loading && user && (
                      <>
                        <span className="text-sm font-medium px-2">Hi, {user.name}</span>
                        {!isDashboard && (
                          <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full gap-2">
                              <User className="w-4 h-4" />
                              Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
            <span className="hidden sm:inline">Go back to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
        )}

        {/* USER ACTIONS - Desktop */}
        <div className="hidden md:flex items-center gap-4">
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
