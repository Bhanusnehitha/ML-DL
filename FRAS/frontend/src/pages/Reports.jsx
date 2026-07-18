import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, BarChart3, AlertTriangle, Loader2 } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { pageThemeConfig } from "@/lib/page-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const theme = pageThemeConfig.reports;

const ATTENDANCE_ENDPOINT = "/api/attendance";

export default function Reports() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(ATTENDANCE_ENDPOINT, {
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setAttendanceRecords(Array.isArray(data) ? data : data.records ?? []);
      } catch (err) {
        setError(err.message || "Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const monthlyReport = useMemo(() => {
    if (attendanceRecords.length === 0) return [];

    // Total distinct days the system logged any activity at all
    const totalDays = new Set(attendanceRecords.map((r) => r.date)).size;

    const byStudent = {};
    for (const r of attendanceRecords) {
      if (!byStudent[r.studentId]) {
        byStudent[r.studentId] = {
          id: r.studentId,
          name: r.studentName,
          class: "—",
          daysPresent: 0,
          incompleteCount: 0
        };
      }
      const entry = byStudent[r.studentId];
      if (r.status === "Present" || r.status === "Late") {
        entry.daysPresent += 1;
      } else if (r.status === "Incomplete") {
        entry.incompleteCount += 1;
      }
    }

    return Object.values(byStudent)
      .map((s) => ({
        ...s,
        totalDays,
        attendancePercent: totalDays ? Math.round((s.daysPresent / totalDays) * 100) : 0
      }))
      .sort((a, b) => b.attendancePercent - a.attendancePercent);
  }, [attendanceRecords]);

  const chartData = useMemo(
    () =>
      monthlyReport.map((r) => ({
        name: r.name,
        attendance: r.attendancePercent,
        incomplete: r.incompleteCount
      })),
    [monthlyReport]
  );

  const downloadReport = () => {
    const header = "Student ID,Name,Class,Days Present,Total Days,Attendance %,Incomplete Days\n";
    const rows = monthlyReport
      .map((r) => `${r.id},${r.name},${r.class},${r.daysPresent},${r.totalDays},${r.attendancePercent}%,${r.incompleteCount}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monthly_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageBanner
        title="Reports"
        subtitle="Monthly attendance summary & insights"
        icon={BarChart3}
        gradient={theme.gradient}
        accentHex={theme.accentHex}
      />

      <div className="flex justify-end">
        <Button
          onClick={downloadReport}
          variant="outline"
          className="gap-2 shrink-0"
          style={{ borderColor: `${theme.accentHex}40`, color: theme.accentHex }}
          disabled={loading || monthlyReport.length === 0}
        >
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Attendance by Student</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2D1515",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: 12,
                color: "#fff"
              }}
            />
            <Bar dataKey="attendance" fill={theme.accentHex} radius={[4, 4, 0, 0]} name="Attendance %" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4 overflow-x-auto"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Days Present</TableHead>
              <TableHead>Total Days</TableHead>
              <TableHead>Incomplete</TableHead>
              <TableHead className="min-w-[180px]">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading report data...
                </TableCell>
              </TableRow>
            )}
            {!loading && monthlyReport.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No attendance data available
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              monthlyReport.map((r) => (
                <TableRow key={r.id} className={r.incompleteCount >= 3 ? "bg-rose-400/5" : ""}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-medium text-white">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.class}</TableCell>
                  <TableCell>{r.daysPresent}</TableCell>
                  <TableCell>{r.totalDays}</TableCell>
                  <TableCell>
                    {r.incompleteCount >= 3 ? (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <AlertTriangle className="h-3 w-3" /> {r.incompleteCount}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{r.incompleteCount}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={r.attendancePercent} className="flex-1 h-2" />
                      <span
                        className={`text-xs font-bold min-w-[36px] text-right ${
                          r.attendancePercent >= 90
                            ? "text-emerald-400"
                            : r.attendancePercent >= 75
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {r.attendancePercent}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}