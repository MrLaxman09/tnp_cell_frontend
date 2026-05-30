import { useEffect, useState } from "react";
import api from "@/api/axios";

import { Card, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await api.get("/placements/analytics");
      setData(res.data);
    };
    fetchAnalytics();
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* 🔥 TOP STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Companies</p>
            <h2 className="text-xl font-bold">{data.totalCompanies}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Applied</p>
            <h2 className="text-xl font-bold">{data.totalApplied}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Selected</p>
            <h2 className="text-xl font-bold">{data.totalSelected}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Placement %</p>
            <h2 className="text-xl font-bold">{data.placementPercentage}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* 📊 CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 🏆 Branch-wise */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold">Branch Placement</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.branchStats}>
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="selected" fill="#22c55e" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 📈 Monthly */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold">Monthly Trend</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyStats}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applied" />
                <Line type="monotone" dataKey="selected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
