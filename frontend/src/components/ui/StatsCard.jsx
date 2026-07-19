export default function StatsCard({ icon, value, label, trend, color = 'primary', delay = 0 }) {
  const colors = {
    primary: {
      bg: 'from-primary-500/20 to-primary-600/10',
      icon: 'text-primary-400',
      border: 'border-primary-500/20',
    },
    success: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    warning: {
      bg: 'from-amber-500/20 to-amber-600/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    danger: {
      bg: 'from-red-500/20 to-red-600/10',
      icon: 'text-red-400',
      border: 'border-red-500/20',
    },
    info: {
      bg: 'from-blue-500/20 to-blue-600/10',
      icon: 'text-blue-400',
      border: 'border-blue-500/20',
    },
  };

  const c = colors[color] || colors.primary;

  return (
    <div
      className={`glass-card p-5 animate-fade-in-up animate-fill-both`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} flex items-center justify-center ${c.icon}`}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend >= 0
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-heading font-bold">{value}</p>
        <p className="text-sm text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
