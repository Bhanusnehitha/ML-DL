import { motion } from "framer-motion";
export function StatCard({ title, value, icon: Icon, accentColor = "#F5A623", subtitle }) {
  return <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, boxShadow: `0 8px 30px ${accentColor}15` }}
    transition={{ duration: 0.2 }}
    className="glass-card rounded-xl p-5 cursor-default"
  >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-white">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div
    className="h-10 w-10 rounded-lg flex items-center justify-center"
    style={{ backgroundColor: `${accentColor}20` }}
  >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
      </div>
    </motion.div>;
}
