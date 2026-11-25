// ============================================================================
// COMPONENT VÒNG TRÒN ĐIỂM HỒI PHỤC BUỔI SÁNG (RADIAL GAUGE)
// ============================================================================

export default function RecoveryGauge({ score, darkMode }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? '#10B981' : clamped >= 55 ? '#F59E0B' : '#EF4444';
  const statusText =
    clamped >= 75
      ? 'Sẵn sàng bứt phá'
      : clamped >= 55
      ? 'Cần nhịp độ vừa phải'
      : 'Ưu tiên hồi phục';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={darkMode ? '#1E293B' : '#E2E8F0'}
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {clamped}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          / 100 điểm
        </span>
      </div>
      <span
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-semibold border"
        style={{
          backgroundColor: `${color}1A`,
          color: color,
          borderColor: `${color}40`,
        }}
      >
        <span className="w-1.5 h-1.5" style={{ backgroundColor: color }} />
        {statusText}
      </span>
    </div>
  );
}
