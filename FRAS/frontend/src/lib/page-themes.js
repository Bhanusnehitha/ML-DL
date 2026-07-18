 

export const pageThemeConfig






 = {
  dashboard: {
    label: "Dashboard",
    gradient: "from-[#0A1628] via-[#0F1D35] to-[#1A2A4A]",
    accentHex: "#F5A623",
    bgDark: "#0A1628",
    sidebarAccent: "bg-amber-500/10 text-amber-400",
    chartColor: "#F5A623",
  },
  recognition: {
    label: "Live Recognition",
    gradient: "from-[#0D3B38] via-[#0F4A46] to-[#134E4A]",
    accentHex: "#00E5FF",
    bgDark: "#0D3B38",
    sidebarAccent: "bg-cyan-400/10 text-cyan-400",
    chartColor: "#00E5FF",
  },
  attendance: {
    label: "Attendance Records",
    gradient: "from-[#1A1A4B] via-[#1E1E5A] to-[#2D2B6B]",
    accentHex: "#A78BFA",
    bgDark: "#1A1A4B",
    sidebarAccent: "bg-purple-400/10 text-purple-400",
    chartColor: "#A78BFA",
  },
  students: {
    label: "Student Management",
    gradient: "from-[#0F2D1F] via-[#133D28] to-[#1A4D33]",
    accentHex: "#34D399",
    bgDark: "#0F2D1F",
    sidebarAccent: "bg-emerald-400/10 text-emerald-400",
    chartColor: "#34D399",
  },
  reports: {
    label: "Reports",
    gradient: "from-[#2D0F0F] via-[#3D1515] to-[#4D1E1E]",
    accentHex: "#FB7185",
    bgDark: "#2D0F0F",
    sidebarAccent: "bg-rose-400/10 text-rose-400",
    chartColor: "#FB7185",
  },
};

export function getThemeFromPath(pathname) {
  if (pathname.startsWith("/recognition")) return "recognition";
  if (pathname.startsWith("/attendance")) return "attendance";
  if (pathname.startsWith("/students")) return "students";
  if (pathname.startsWith("/reports")) return "reports";
  return "dashboard";
}
