import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import api from "@/api/axios";

const Hero = () => {
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await api.get("/highlights");
        setHighlights(res.data.highlight);
      } catch (error) {
        console.error("Failed to fetch highlights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-subtle" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-subtle"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-primary-foreground/80">
              Placement Season 2024-25 is Live
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up">
            Building Careers,
            <br />
            <span className="text-gradient">Shaping Futures</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-fade-in-delay-1">
            The Training & Placement Cell connects talented students with
            industry-leading companies through comprehensive training programs
            and placement opportunities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <Button variant="hero" size="xl" className="group">
              Explore Opportunities
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              View Upcoming Drives
            </Button>
          </div>

          {/* Stats row (DYNAMIC FROM BACKEND) */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-primary-foreground/10 animate-fade-in-delay-3">
            {loading ? (
              <div className="col-span-3 text-center text-primary-foreground/70">
                Loading highlights...
              </div>
            ) : highlights ? (
              <>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                    {highlights.studentsTrained}
                  </div>
                  <div className="text-sm text-primary-foreground/60">
                    Students Trained
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                    {highlights.partnerCompanies}
                  </div>
                  <div className="text-sm text-primary-foreground/60">
                    Partner Companies
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                    {highlights.highestPackage}
                  </div>
                  <div className="text-sm text-primary-foreground/60">
                    Highest Package
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center text-primary-foreground/70">
                No highlights available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
