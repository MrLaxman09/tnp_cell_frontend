import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";

const AdminHighlights = () => {
  const [formData, setFormData] = useState({
    studentsTrained: "",
    partnerCompanies: "",
    placementRate: "",
    highestPackage: "",
    averagePackage: "",
    trainingPrograms: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch existing highlight
  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const res = await api.get("/highlights");

        if (res.data.highlight) {
          const h = res.data.highlight;

          // ✅ IMPORTANT: Only set actual form fields (avoid _id, timestamps)
          setFormData({
            studentsTrained: h.studentsTrained || "",
            partnerCompanies: h.partnerCompanies || "",
            placementRate: h.placementRate || "",
            highestPackage: h.highestPackage || "",
            averagePackage: h.averagePackage || "",
            trainingPrograms: h.trainingPrograms || "",
          });
        }
      } catch (error) {
        console.error("Fetch highlight error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlight();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/highlights", formData, {
        withCredentials: true,
      });

      alert("Highlights updated successfully!");
    } catch (error) {
      console.error("Save highlight error:", error);
      alert("Failed to update highlights.");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading highlights...</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Update Placement Highlights</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Placement Statistics</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Students Trained */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Students Trained</label>
                <Input
                  name="studentsTrained"
                  placeholder="e.g. 1200+"
                  value={formData.studentsTrained}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Partner Companies */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Partner Companies</label>
                <Input
                  name="partnerCompanies"
                  placeholder="e.g. 80+"
                  value={formData.partnerCompanies}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Placement Rate */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Placement Rate</label>
                <Input
                  name="placementRate"
                  placeholder="e.g. 92%"
                  value={formData.placementRate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Highest Package */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Highest Package</label>
                <Input
                  name="highestPackage"
                  placeholder="e.g. 18 LPA"
                  value={formData.highestPackage}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Average Package */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Average Package</label>
                <Input
                  name="averagePackage"
                  placeholder="e.g. 6.5 LPA"
                  value={formData.averagePackage}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Training Programs */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Training Programs</label>
                <Input
                  name="trainingPrograms"
                  placeholder="e.g. 25+"
                  value={formData.trainingPrograms}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="gap-2 w-full md:w-auto">
              <Save className="w-4 h-4" />
              Save Highlights
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHighlights;
