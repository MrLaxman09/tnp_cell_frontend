import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== FETCH COMPANIES FROM BACKEND =====
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/companies");
        setCompanies(res.data.companies || []);
      } catch (err) {
        console.error("Fetch companies error:", err);
        setError("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="text-muted-foreground">Loading companies...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section id="companies" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Recruitment Drives
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Upcoming Company Visits
          </h2>
          <p className="text-muted-foreground text-lg">
            Top recruiters visiting our campus this placement season.
            Register early to secure your slot.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length === 0 ? (
            <p className="text-muted-foreground col-span-3 text-center">
              No companies available right now.
            </p>
          ) : (
            companies.map((company) => {
              const companyName = company.companyName || "Unknown Company";

              return (
                <div
                  key={company._id}
                  className="group bg-card rounded-2xl p-6 border border-border card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={companyName}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {companyName.charAt(0)}
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-foreground">
                          {companyName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {company.role || "Role not specified"}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary">
                      {company.status || "Upcoming"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{company.visitDate || "TBA"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location || "TBA"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{company.posts || 0} Posts</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Package
                    </span>
                    <span className="font-semibold text-accent">
                      {company.package
                        ? `${company.package} LPA`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Companies;
