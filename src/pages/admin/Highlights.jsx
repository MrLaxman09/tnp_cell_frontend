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
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              name="studentsTrained"
              placeholder="Students Trained (e.g. 1200+)"
              value={formData.studentsTrained}
              onChange={handleChange}
              required
            />

            <Input
              name="partnerCompanies"
              placeholder="Partner Companies (e.g. 80+)"
              value={formData.partnerCompanies}
              onChange={handleChange}
              required
            />

            <Input
              name="placementRate"
              placeholder="Placement Rate (e.g. 92%)"
              value={formData.placementRate}
              onChange={handleChange}
              required
            />

            <Input
              name="highestPackage"
              placeholder="Highest Package (e.g. 18 LPA)"
              value={formData.highestPackage}
              onChange={handleChange}
              required
            />

            <Input
              name="averagePackage"
              placeholder="Average Package (e.g. 6.5 LPA)"
              value={formData.averagePackage}
              onChange={handleChange}
              required
            />

            <Input
              name="trainingPrograms"
              placeholder="Training Programs (e.g. 25+)"
              value={formData.trainingPrograms}
              onChange={handleChange}
              required
            />

            <Button type="submit" className="gap-2">
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
