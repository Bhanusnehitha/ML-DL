import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import LiveRecognition from "./pages/LiveRecognition";
import AttendanceRecords from "./pages/AttendanceRecords";
import StudentManagement from "./pages/StudentManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
const queryClient = new QueryClient();
const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/recognition" element={<LiveRecognition />} />
              <Route path="/attendance" element={<AttendanceRecords />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>;
};
export default App;
