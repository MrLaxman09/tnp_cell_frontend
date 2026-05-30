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

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20 bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">
      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] bottom-[-100px] right-[-100px]" />

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-base text-gray-300">
              Placement Season 2026 
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Building Careers <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Shaping Futures
            </span>
          </h1>

          {/* Sub text */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Connect with top companies, get trained, and land your dream job
            through our smart placement system.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-all"
              onClick={() => scrollToSection("trainings")}
            >
              Explore Opportunities
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-black hover:text-white hover:bg-white/10"
              onClick={() => scrollToSection("companies")}
            >
              View Drives
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            {loading ? (
              <p className="col-span-3 text-gray-400">Loading...</p>
            ) : highlights ? (
              <>
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:scale-105 transition">
                  <h2 className="text-3xl font-bold text-white">
                    {highlights.studentsTrained}
                  </h2>
                  <p className="text-gray-400">Students Trained</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:scale-105 transition">
                  <h2 className="text-3xl font-bold text-white">
                    {highlights.partnerCompanies}
                  </h2>
                  <p className="text-gray-400">Companies</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:scale-105 transition">
                  <h2 className="text-3xl font-bold text-pink-400">
                    {highlights.highestPackage}
                  </h2>
                  <p className="text-gray-400">Highest Package</p>
                </div>
              </>
            ) : (
              <p className="col-span-3 text-gray-400">
                No highlights available
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
