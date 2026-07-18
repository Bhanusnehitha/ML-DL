import { motion } from "framer-motion";
export function PageBanner({ title, subtitle, icon: Icon, gradient, accentHex }) {
  return <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${gradient} p-6 md:p-8`}
  >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05),_transparent_70%)]" />
      <div className="relative flex items-center gap-4">
        <div
    className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
    style={{ backgroundColor: `${accentHex}20` }}
  >
          <Icon className="h-6 w-6" style={{ color: accentHex }} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </motion.div>;
}
