import { useEffect, useState } from "react";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== FETCH TRAININGS FROM BACKEND =====
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const res = await api.get("/trainings");
        setTrainings(res.data.trainings || []);
      } catch (err) {
        console.error("Fetch trainings error:", err);
        setError("Failed to load trainings");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-background text-center">
        <p className="text-muted-foreground">Loading trainings...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-background text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section id="trainings" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              Skill Development
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Upcoming Trainings & Workshops
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Industry-aligned training programs to enhance your technical and
              soft skills.
            </p>
          </div>

          {/* <Button variant="outline" className="mt-6 md:mt-0 gap-2 group">
            View All Programs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button> */}
        </div>

        {trainings.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No trainings available right now.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {trainings.map((training) => {
              const startDate = training.date
                ? new Date(training.date).toDateString()
                : "TBA";

              return (
                <div
                  key={training._id}
                  className="group glass-card rounded-2xl p-6 card-hover flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent">
                      {training.status || "Upcoming"}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {training.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-2">
                    <b>Instructor:</b> {training.instructor}
                  </p>

                  <p className="text-muted-foreground text-sm mb-6">
                    <b>Department:</b> {training.department}
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{training.duration}</span>
                    </div>

                    <span className="ml-auto text-sm font-medium text-accent">
                      Starts {startDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Trainings;
