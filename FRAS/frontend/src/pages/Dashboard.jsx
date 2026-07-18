import { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PageBanner } from "@/components/PageBanner";
import { pageThemeConfig } from "@/lib/page-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { LayoutDashboard, Loader2 } from "lucide-react";

const theme = pageThemeConfig.dashboard;

const ATTENDANCE_ENDPOINT = "/api/attendance";
const STUDENTS_ENDPOINT = "/api/students";

const statusColors = {
  Present: "text-emerald-400 bg-emerald-400/15",
  Absent: "text-red-400 bg-red-400/15",
  Late: "text-amber-400 bg-amber-400/15",
  Incomplete: "text-orange-400 bg-orange-400/15"
};

function toDateKey(date) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function last7DayKeys() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

export default function Dashboard() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [attendanceRes, studentsRes] = await Promise.all([
          fetch(ATTENDANCE_ENDPOINT, { headers: { "Content-Type": "application/json" } }),
          fetch(STUDENTS_ENDPOINT, { headers: { "Content-Type": "application/json" } })
        ]);

        if (!attendanceRes.ok) {
          throw new Error(`Attendance request failed: ${attendanceRes.status} ${attendanceRes.statusText}`);
        }
        if (!studentsRes.ok) {
          throw new Error(`Students request failed: ${studentsRes.status} ${studentsRes.statusText}`);
        }

        const attendanceData = await attendanceRes.json();
        const studentsData = await studentsRes.json();

        setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : attendanceData.records ?? []);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const todayKey = toDateKey(new Date());

  const todayRecords = useMemo(
    () => attendanceRecords.filter((r) => r.date === todayKey),
    [attendanceRecords, todayKey]
  );

  const totalStudents = students.length;

  const present = todayRecords.filter((r) => r.status === "Present").length;
  const absent = todayRecords.filter((r) => r.status === "Absent").length; // always 0 until roster-comparison logic exists
  const late = todayRecords.filter((r) => r.status === "Late").length;

  const weeklyData = useMemo(() => {
    const dayKeys = last7DayKeys();
    return dayKeys.map((key) => {
      const dayRecords = attendanceRecords.filter((r) => r.date === key);
      const dayLabel = new Date(key).toLocaleDateString(undefined, { weekday: "short" });
      return {
        day: dayLabel,
        present: dayRecords.filter((r) => r.status === "Present").length,
        late: dayRecords.filter((r) => r.status === "Late").length,
        absent: dayRecords.filter((r) => r.status === "Absent").length
      };
    });
  }, [attendanceRecords]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageBanner
        title="Dashboard"
        subtitle="Attendance overview for today"
        icon={LayoutDashboard}
        gradient={theme.gradient}
        accentHex={theme.accentHex}
      />

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading dashboard...
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={totalStudents} icon={Users} accentColor={theme.accentHex} subtitle="Across all classes" />
            <StatCard
              title="Present Today"
              value={present}
              icon={UserCheck}
              accentColor="#34D399"
              subtitle={`${totalStudents ? Math.round((present / totalStudents) * 100) : 0}% attendance`}
            />
            <StatCard title="Absent Today" value={absent} icon={UserX} accentColor="#FB7185" />
            <StatCard title="Late Arrivals" value={late} icon={Clock} accentColor="#FBBF24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass-card rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Attendance Trends</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A2035",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: 12,
                      color: "#fff"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="#F5A623" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="late" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Late" />
                  <Bar dataKey="absent" fill="#FB7185" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-[280px] overflow-auto">
                {todayRecords.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity yet today</p>
                )}
                {todayRecords.map((r) => (
                  <div key={`${r.studentId}-${r.date}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: `${theme.accentHex}20`, color: theme.accentHex }}
                    >
                      {r.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground">{r.checkInTime !== "-" ? r.checkInTime : "No check-in"}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}