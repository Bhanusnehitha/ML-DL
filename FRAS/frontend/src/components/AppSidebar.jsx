import {
  LayoutDashboard,
  ScanFace,
  ClipboardList,
  Users,
  BarChart3
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { getThemeFromPath, pageThemeConfig } from "@/lib/page-themes";
const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, theme: "dashboard" },
  { title: "Live Recognition", url: "/recognition", icon: ScanFace, theme: "recognition" },
  { title: "Attendance", url: "/attendance", icon: ClipboardList, theme: "attendance" },
  { title: "Students", url: "/students", icon: Users, theme: "students" },
  { title: "Reports", url: "/reports", icon: BarChart3, theme: "reports" }
];
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentTheme = getThemeFromPath(location.pathname);
  const config = pageThemeConfig[currentTheme];
  return <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div
    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500"
    style={{ backgroundColor: `${config.accentHex}20` }}
  >
            <ScanFace className="h-5 w-5 transition-colors duration-500" style={{ color: config.accentHex }} />
          </div>
          {!collapsed && <div>
              <h2 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">
                AttendAI
              </h2>
              <p className="text-[10px] text-sidebar-muted">University Portal</p>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
    const isActive = item.theme === currentTheme;
    const itemConfig = pageThemeConfig[item.theme];
    return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
      to={item.url}
      end={item.url === "/"}
      className="hover:bg-white/5 transition-all duration-300 rounded-lg"
      activeClassName="font-semibold"
      style={isActive ? {
        backgroundColor: `${itemConfig.accentHex}15`,
        color: itemConfig.accentHex
      } : void 0}
    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-xs text-sidebar-muted">🎓</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>;
}
