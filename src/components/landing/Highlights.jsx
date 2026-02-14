import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Building2,
  Trophy,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import api from "@/api/axios";

const Highlights = () => {
  const [highlight, setHighlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== FETCH HIGHLIGHTS (REAL-TIME EVERY 30 SECONDS) =====
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await api.get("/highlights");

        // ✅ IMPORTANT FIX: Handle all possible response shapes
        const data =
          res.data?.highlight ||
          res.data?.data?.highlight ||
          res.data ||
          null;

        setHighlight(data || null);
        setError("");
      } catch (err) {
        console.error("Error fetching highlights:", err);
        setError("Failed to load highlights");
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();

    const interval = setInterval(fetchHighlights, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Loading highlights...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">{error}</div>
    );
  }

  // ✅ STRONGER CHECK (prevents false "No highlights")
  if (
    !highlight ||
    Object.keys(highlight).length === 0 ||
    !highlight.studentsTrained
  ) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No highlights available
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      value: highlight.studentsTrained,
      label: "Students Trained",
      description: "Industry-ready graduates",
    },
    {
      icon: Building2,
      value: highlight.partnerCompanies,
      label: "Partner Companies",
      description: "Fortune 500 to startups",
    },
    {
      icon: TrendingUp,
      value: highlight.placementRate,
      label: "Placement Rate",
      description: "Consistently high success",
    },
    {
      icon: Trophy,
      value: highlight.highestPackage,
      label: "Highest Package",
      description: "This academic year",
    },
    {
      icon: Briefcase,
      value: highlight.averagePackage,
      label: "Average Package",
      description: "Competitive compensation",
    },
    {
      icon: GraduationCap,
      value: highlight.trainingPrograms,
      label: "Training Programs",
      description: "Technical & soft skills",
    },
  ];

  return (
    <section
      id="highlights"
      className="py-24 bg-hero relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3 mb-4">
            Placement Highlights
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Numbers that reflect our commitment to student success and industry
            partnerships.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-accent" />
              </div>

              <div className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>

              <div className="text-sm font-medium text-primary-foreground/80 mb-1">
                {stat.label}
              </div>

              <div className="text-xs text-primary-foreground/50">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
