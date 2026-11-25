import { Moon, Zap, Watch, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';

// ============================================================================
// PHÂN HỆ B: PHÂN TÍCH CHU KỲ GIẤC NGỦ & CHỐNG QUÁN TÍNH GIẤC NGỦ
// ============================================================================

export default function SleepTab({
  sleepDeprived,
  sleepHypnogramData,
  bedTime,
  setBedTime,
  maxWakeTime,
  setMaxWakeTime,
  tomorrowPriority,
  setTomorrowPriority,
  smartWake,
  darkMode,
  sharpTooltipStyle,
  onSyncWakeAlarm,
}) {
  return (
    <div className="space-y-6">
      {/* Biểu đồ cấu trúc chu kỳ giấc ngủ 90 phút đêm qua */}
      <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Moon className="w-3.5 h-3.5" /> Phân tích cấu trúc giấc ngủ đêm qua
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Biểu đồ Chu kỳ Giấc ngủ 90 phút (N1 → N2 → N3 → REM)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {sleepDeprived
                ? 'Đêm qua ngủ muộn lúc 01:05 · Chỉ đạt 3 chu kỳ, thiếu giấc ngủ sâu N3'
                : 'Đêm qua ngủ từ 22:45 – 06:15 · Hoàn tất trọn vẹn 5 chu kỳ sinh học (7h30p)'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-none text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
              Ngủ sâu N3: {sleepDeprived ? '1h 05p' : '2h 08p'}
            </span>
            <span className="px-3 py-1 rounded-none text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              Ngủ mơ REM: {sleepDeprived ? '1h 10p' : '1h 52p'}
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sleepHypnogramData} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: darkMode ? '#94A3B8' : '#64748B' }} />
              <YAxis
                domain={[0.5, 4.4]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(v) =>
                  v === 1 ? 'N3 Sâu' : v === 2 ? 'N2 Nông' : v === 3 ? 'REM' : 'N1/Tỉnh'
                }
                tick={{ fontSize: 11, fill: darkMode ? '#94A3B8' : '#64748B' }}
                width={62}
              />
              <Tooltip
                formatter={(_value, _name, props) => [props.payload.label, 'Giai đoạn']}
                contentStyle={sharpTooltipStyle}
              />
              {!sleepDeprived && (
                <ReferenceArea
                  x1="05:50"
                  x2="06:15"
                  fill="#10B981"
                  fillOpacity={0.22}
                  label={{
                    value: 'Rung êm N2',
                    position: 'insideTop',
                    fill: '#059669',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <Area
                type="stepAfter"
                dataKey="stage"
                stroke="#7C3AED"
                strokeWidth={2.5}
                fill="url(#sleepGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chú giải 4 giai đoạn ngủ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { code: 'N1 · Ru ngủ', desc: 'Chuyển tiếp 10–15 phút, nhịp tim bắt đầu hạ', color: 'bg-slate-400' },
            { code: 'N2 · Ngủ nông', desc: 'Cửa sổ vàng để đánh thức nhẹ nhàng', color: 'bg-emerald-500' },
            { code: 'N3 · Ngủ sâu', desc: 'Phục hồi cơ bắp và hormone tăng trưởng', color: 'bg-indigo-600' },
            { code: 'REM · Ngủ mơ', desc: 'Củng cố trí nhớ dài hạn và sáng tạo', color: 'bg-purple-500' },
          ].map((s, i) => (
            <div
              key={i}
              className="p-3.5 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                <span className={`w-2.5 h-2.5 shrink-0 ${s.color}`} />
                <span>{s.code}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bộ tính giờ thức giấc thông minh chống Quán tính giấc ngủ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" /> Anti-Sleep Inertia Engine
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
              Thiết lập Đánh thức Thông minh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nhập khung giờ tối nay để ChronoMind Band tự chọn điểm rung cổ tay êm ái nhất sáng mai.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Giờ đi ngủ dự kiến tối nay
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Giờ hẹn thức dậy tối đa sáng mai
              </label>
              <input
                type="time"
                value={maxWakeTime}
                onChange={(e) => setMaxWakeTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Mức độ ưu tiên công việc ngày mai
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Nhẹ nhàng' },
                  { id: 'normal', label: 'Bình thường' },
                  { id: 'high', label: 'Thi / Kiểm tra' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTomorrowPriority(opt.id)}
                    className={`py-2.5 px-2 rounded-none text-xs font-semibold border transition ${
                      tomorrowPriority === opt.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onSyncWakeAlarm}
            className="w-full py-3 rounded-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <Watch className="w-4 h-4" />
            Đồng bộ cửa sổ đánh thức lên Vòng tay
          </button>
        </div>

        {/* Kết quả tính toán cửa sổ đánh thức */}
        <div className="lg:col-span-3 rounded-none bg-gradient-to-br from-purple-50 via-white to-emerald-50/70 dark:from-purple-950/30 dark:via-slate-900 dark:to-emerald-950/20 border border-purple-200 dark:border-purple-800/50 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Cửa sổ đánh thức chống Quán tính giấc ngủ
              </span>
              <span className="px-3 py-1 rounded-none bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                Pha ngủ nông (N2)
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {smartWake.windowStart}
              </span>
              <span className="text-2xl font-bold text-purple-500">→</span>
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {smartWake.windowEnd}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3.5 rounded-none bg-white/85 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Chu kỳ 90p hoàn tất</div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                  {smartWake.fullCycles} chu kỳ
                </div>
              </div>
              <div className="p-3.5 rounded-none bg-white/85 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Thời gian ngủ thực</div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  ~{smartWake.totalSleepHours} giờ
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-none bg-white/85 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Cơ chế đánh thức</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                  Rung nhẹ cổ tay (Không chuông ồn)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-none bg-white/90 dark:bg-slate-800/80 border border-purple-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Vì sao ChronoMind chọn khung giờ này?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {smartWake.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
