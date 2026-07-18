import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { pageThemeConfig } from "@/lib/page-themes";
import { motion } from "framer-motion";

const theme = pageThemeConfig.attendance;

const ATTENDANCE_ENDPOINT = "/api/attendance";

const statusBadge = {
  Present: "bg-emerald-400/15 text-emerald-400",
  Absent: "bg-red-400/15 text-red-400",
  Late: "bg-amber-400/15 text-amber-400",
  Incomplete: "bg-orange-400/15 text-orange-400"
};
const statusEmoji = {
  Present: "\u2705",
  Absent: "\u274C",
  Late: "\u{1F550}",
  Incomplete: "\u26A0\uFE0F"
};

export default function AttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  useEffect(() => {
    fetchAttendance();
  }, []);

  const dates = useMemo(
    () => [...new Set(attendanceRecords.map((r) => r.date))],
    [attendanceRecords]
  );

  const filtered = useMemo(() => {
    return attendanceRecords.filter((r) => {
      const matchSearch =
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentId.toLowerCase().includes(search.toLowerCase());
      const matchDate = dateFilter === "all" || r.date === dateFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [attendanceRecords, search, dateFilter, statusFilter]);

  const exportCSV = () => {
    const header = "Student ID,Name,Date,Check-in Time,Check-out Time,Status\n";
    const rows = filtered
      .map((r) => `${r.studentId},${r.studentName},${r.date},${r.checkInTime},${r.checkOutTime},${r.status}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageBanner
        title="Attendance Records"
        subtitle="View and export attendance data"
        icon={ClipboardList}
        gradient={theme.gradient}
        accentHex={theme.accentHex}
      />

      <div className="flex justify-end gap-2">
        <Button onClick={fetchAttendance} variant="outline" className="gap-2 shrink-0" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="gap-2 shrink-0"
          style={{ borderColor: `${theme.accentHex}40`, color: theme.accentHex }}
          disabled={loading || filtered.length === 0}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {dates.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Present">Present ✅</SelectItem>
              <SelectItem value="Absent">Absent ❌</SelectItem>
              <SelectItem value="Late">Late 🕐</SelectItem>
              <SelectItem value="Incomplete">Incomplete ⚠️</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading attendance data...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((r, i) => (
                  <TableRow
                    key={`${r.studentId}-${r.date}-${i}`}
                    className={r.status === "Incomplete" ? "bg-orange-400/5" : ""}
                  >
                    <TableCell className="font-mono text-xs">{r.studentId}</TableCell>
                    <TableCell className="font-medium text-white">{r.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    <TableCell className="font-mono">{r.checkInTime}</TableCell>
                    <TableCell className="font-mono">{r.checkOutTime}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}>
                        {statusEmoji[r.status]} {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}