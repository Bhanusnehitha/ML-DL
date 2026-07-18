import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import { getThemeFromPath } from "@/lib/page-themes";
import { AnimatePresence, motion } from "framer-motion";
export function AppLayout({ children }) {
  const location = useLocation();
  const theme = getThemeFromPath(location.pathname);
  return <SidebarProvider>
      <div className="min-h-screen flex w-full" data-page-theme={theme}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 px-4 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm text-muted-foreground font-mono">
              {(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })}
            </span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}
