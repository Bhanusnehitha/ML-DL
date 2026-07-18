import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScanFace, Play, Square, LogIn, LogOut, AlertTriangle } from "lucide-react";
// import { students } from "@/lib/mock-data";
import { PageBanner } from "@/components/PageBanner";
import { pageThemeConfig } from "@/lib/page-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const theme = pageThemeConfig.recognition;
export default function LiveRecognition() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [detectedIndex, setDetectedIndex] = useState(null);
  const [checkMode, setCheckMode] = useState("check-in");
  const [checkedIn, setCheckedIn] = useState(/* @__PURE__ */ new Set());
  const [backendResult, setBackendResult] = useState(null);
  const [warningStudent, setWarningStudent] = useState(null);
  useEffect(() => {
  if (!running) {
    setStatus("idle");
    setDetectedIndex(null);
    return;
  }

  const interval = setInterval(async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/result");
      const data = await response.json();

      setBackendResult(data);

      if (data.status === "known") {
        setStatus("recognized");
      } else {
        setStatus("unknown");
      }

    } catch (err) {
      console.error(err);
    }
  }, 1000);

  return () => clearInterval(interval);

}, [running]); 
  
  return <div className="space-y-6 max-w-5xl mx-auto">
      <PageBanner
    title="Live Recognition"
    subtitle="Face recognition check-in & check-out"
    icon={ScanFace}
    gradient={theme.gradient}
    accentHex={theme.accentHex}
  />

      {
    /* Check-in / Check-out mode toggle */
  }
      <div className="flex gap-3">
        <Button
    onClick={() => setCheckMode("check-in")}
    variant={checkMode === "check-in" ? "default" : "outline"}
    className="gap-2"
    style={checkMode === "check-in" ? { backgroundColor: theme.accentHex, color: "#000" } : {}}
  >
          <LogIn className="h-4 w-4" /> ✅ Check-In (Morning)
        </Button>
        <Button
    onClick={() => setCheckMode("check-out")}
    variant={checkMode === "check-out" ? "default" : "outline"}
    className="gap-2"
    style={checkMode === "check-out" ? { backgroundColor: theme.accentHex, color: "#000" } : {}}
  >
          <LogOut className="h-4 w-4" /> 🚪 Check-Out (Evening)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
    className="lg:col-span-2 glass-card rounded-xl overflow-hidden"
    style={{ borderColor: running ? `${theme.accentHex}40` : void 0, borderWidth: running ? 2 : void 0 }}
  >
          <div className="relative aspect-video bg-black/40 flex items-center justify-center">
            <ScanFace className="h-20 w-20 text-white/10" />
            {running && <>
                <div className="absolute inset-0 m-8 rounded-sm" style={{ border: `2px solid ${theme.accentHex}40` }} />
                <div className="absolute left-8 right-8 h-0.5 animate-scan-line" style={{ backgroundColor: `${theme.accentHex}90` }} />
              </>}
            <div className="absolute bottom-3 left-3">
              <span
    className={`text-xs font-mono px-2 py-1 rounded ${running ? "text-cyan-300" : "text-white/40"}`}
    style={running ? { backgroundColor: `${theme.accentHex}20` } : { backgroundColor: "rgba(255,255,255,0.05)" }}
  >
                {running ? "\u25CF LIVE" : "\u25CB OFFLINE"}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span
    className="text-xs font-semibold px-3 py-1 rounded-full"
    style={{ backgroundColor: `${theme.accentHex}20`, color: theme.accentHex }}
  >
                {checkMode === "check-in" ? "CHECK-IN MODE" : "CHECK-OUT MODE"}
              </span>
            </div>
          </div>
          <div className="p-4 flex justify-center">
            <Button
    onClick={async () => {

    if (!running) {

        const response = await fetch("http://127.0.0.1:5000/api/start", {
            method: "POST",
        });

        console.log(await response.json());
    }

    setRunning(!running);

}}
    className="gap-2"
    style={running ? {} : { backgroundColor: theme.accentHex, color: "#000" }}
    variant={running ? "destructive" : "default"}
  >
              {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Stop Recognition" : "Start Recognition"}
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-4">Detection Result</h3>
          <AnimatePresence mode="wait">
            {status === "idle" && <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Start recognition to begin</p>
              </motion.div>}
            {status === "scanning" && <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-2 animate-pulse-ring" style={{ borderColor: theme.accentHex }} />
                  <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.accentHex}15` }}>
                    <ScanFace className="h-8 w-8" style={{ color: theme.accentHex }} />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Scanning...</p>
              </motion.div>}
            {status === "recognized" && backendResult && <motion.div key="recognized" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="h-20 w-20 rounded-full border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {backendResult?.name?.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white">{backendResult.name}</p>
                  <p className="text-xs text-muted-foreground">Confidence: {(backendResult?.confidence * 100).toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {checkMode === "check-in" ? "Check-in" : "Check-out"}: {(/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-400">
                  Recognized ✅
                </span>
              </motion.div>}
            {status === "unknown" && <motion.div key="unknown" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="h-20 w-20 rounded-full bg-red-400/10 border-2 border-red-400 flex items-center justify-center text-2xl text-red-400">
                  ?
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-400/15 text-red-400">
                  Unknown ❌
                </span>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      {
    /* Warning Dialog */
  }
      <Dialog open={!!warningStudent} onOpenChange={() => setWarningStudent(null)}>
        <DialogContent className="border-red-500/50 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              🚨 No Check-In Recorded
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            No Check-In recorded for <span className="font-semibold text-white">{warningStudent}</span> today! 
            Please ensure the student checks in before attempting check-out.
          </p>
          <Button variant="destructive" onClick={() => setWarningStudent(null)} className="w-full">
            Dismiss
          </Button>
        </DialogContent>
      </Dialog>
    </div>;
}
