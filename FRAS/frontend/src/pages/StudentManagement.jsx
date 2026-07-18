import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Users, Loader2 } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { pageThemeConfig } from "@/lib/page-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const theme = pageThemeConfig.students;
const STUDENTS_ENDPOINT = "/api/students";

export default function StudentManagement() {
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", id: "", class: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(STUDENTS_ENDPOINT);
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setStudentList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const classes = [...new Set(studentList.map((s) => s.class).filter(Boolean))];

  const filtered = useMemo(() => {
    return studentList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());
      const matchClass = classFilter === "all" || s.class === classFilter;
      return matchSearch && matchClass;
    });
  }, [studentList, search, classFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", id: "", class: "" });
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, id: s.id, class: s.class });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.id || !form.class) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`${STUDENTS_ENDPOINT}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, class: form.class })
        });
        if (!res.ok) throw new Error("Failed to update student");
        const updated = await res.json();
        setStudentList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast({ title: "Student updated" });
      } else {
        const res = await fetch(STUDENTS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to add student");
        }
        const created = await res.json();
        setStudentList((prev) => [...prev, created]);
        toast({ title: "Student added" });
      }
      setDialogOpen(false);
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${STUDENTS_ENDPOINT}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      setStudentList((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Student removed", variant: "destructive" });
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageBanner
        title="Student Management"
        subtitle="Manage enrolled students"
        icon={Users}
        gradient={theme.gradient}
        accentHex={theme.accentHex}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gap-2 shrink-0" style={{ backgroundColor: theme.accentHex, color: "#000" }}>
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Student" : "Add New Student"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Rahman" />
              </div>
              <div>
                <Label>Student ID</Label>
                <Input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. s11"
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="e.g. 10-A" />
              </div>
              <Button
                onClick={handleSave}
                className="w-full"
                style={{ backgroundColor: theme.accentHex, color: "#000" }}
                disabled={saving}
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading students...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-16">No students found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!loading && filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-xl p-4 flex flex-col items-center text-center group"
          >
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold mb-3"
              style={{ backgroundColor: `${theme.accentHex}15`, color: theme.accentHex }}
            >
              {s.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="font-semibold text-white">{s.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{s.id}</p>
            {s.class && (
              <span className="text-xs mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.accentHex}15`, color: theme.accentHex }}>
                {s.class}
              </span>
            )}
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(s)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-400/10" onClick={() => handleDelete(s.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}