import { AlertTriangle, Heart, Activity, Wind, Sparkles, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { INITIAL_ACTIGRAPHY } from '../data/mockData';
import RecoveryGauge from './RecoveryGauge';

// ============================================================================
// PHÂN HỆ A: TRUNG TÂM SINH HỌC & CẢM BIẾN THỜI GIAN THỰC (BIOMETRIC HUB)
// ============================================================================

export default function BiometricsTab({
  isStressWarning,
  liveHrv,
  liveHr,
  liveSpo2,
  morningRecovery,
  ppgChartData,
  darkMode,
  sharpTooltipStyle,
  onOpenBreathing,
  onAutoRebalance,
}) {
  return (
    <div className="space-y-6">
      {/* Cảnh báo mềm tự động khi HRV giảm & nhịp tim nghỉ tăng */}
      {isStressWarning && (
        <div className="rounded-none p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-none bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                Tín hiệu mềm từ hệ thần kinh: HRV giảm ({liveHrv} ms) kèm nhịp tim tăng ({liveHr} bpm)
              </h4>
              <p className="text-xs sm:text-sm text-amber-800/85 dark:text-amber-300/80 mt-0.5">
                Cơ thể có dấu hiệu căng thẳng hoặc mệt mỏi tích lũy. Không sao cả — bạn có thể thử hít thở 60 giây hoặc giãn nhẹ lịch học hôm nay nhé.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenBreathing}
              className="px-4 py-2 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              Hít thở 60 giây
            </button>
            <button
              onClick={() => onAutoRebalance('cảnh báo sinh học PPG')}
              className="px-4 py-2 rounded-none bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100/50 transition"
            >
              Giãn lịch hôm nay
            </button>
          </div>
        </div>
      )}

      {/* Hàng KPI Cảm biến PPG + Điểm hồi phục buổi sáng */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nhịp tim (PPG Optical)
            </span>
            <span className="p-2 rounded-none bg-rose-50 dark:bg-rose-950/50 text-rose-500">
              <Heart className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{liveHr}</span>
            <span className="text-sm font-medium text-slate-500">bpm</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {liveHr > 95
              ? 'Cao hơn mức nghỉ bình thường (64 bpm)'
              : 'Nhịp tim nghỉ ổn định · Tim mạch khỏe mạnh'}
          </p>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Biến thiên nhịp tim (HRV)
            </span>
            <span className="p-2 rounded-none bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{liveHrv}</span>
            <span className="text-sm font-medium text-slate-500">ms</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {liveHrv < 45
              ? 'Giảm sâu · Cần ưu tiên hồi phục hệ thần kinh'
              : 'Khả năng thích ứng căng thẳng rất tốt'}
          </p>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Oxy máu (SpO2)
            </span>
            <span className="p-2 rounded-none bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Wind className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{liveSpo2}</span>
            <span className="text-sm font-medium text-slate-500">%</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Lưu thông oxy lên não tối ưu (Ngưỡng chuẩn 96–100%)
          </p>
        </div>

        <div className="rounded-none bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Ngân sách Năng lượng Hôm nay
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
              {morningRecovery}
            </span>
            <span className="text-sm font-medium text-emerald-700/70 dark:text-emerald-400">
              / 100
            </span>
          </div>
          <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-300/80">
            {morningRecovery >= 75
              ? 'Đề xuất: 3h tư duy sâu + 1.5h sáng tạo + 1h thể thao'
              : 'Đề xuất: Giữ 1.5h bài cốt lõi + thêm 30p nghỉ hồi phục'}
          </p>
        </div>
      </div>

      {/* Khu vực Biểu đồ PPG thời gian thực + Điểm hồi phục buổi sáng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Xu hướng Cảm biến Quang học PPG trong ngày
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đối chiếu Nhịp tim (bpm) và Biến thiên nhịp tim HRV (ms) theo thời gian thực
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 bg-blue-600" /> HR (bpm)
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 bg-emerald-500" /> HRV (ms)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ppgChartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrvFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: darkMode ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: darkMode ? '#94A3B8' : '#64748B' }} domain={[20, 130]} />
                <Tooltip contentStyle={sharpTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="hrv"
                  name="HRV (ms)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#hrvFill)"
                />
                <Line
                  type="monotone"
                  dataKey="hr"
                  name="Nhịp tim (bpm)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Điểm Hồi Phục Buổi Sáng chi tiết */}
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Điểm Hồi phục Buổi sáng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tổng hợp từ HRV ban đêm & cấu trúc chu kỳ giấc ngủ
            </p>
          </div>

          <div className="my-4">
            <RecoveryGauge score={morningRecovery} darkMode={darkMode} />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Phân bổ Tư duy sâu (Toán/Lý)</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {morningRecovery >= 75 ? 'Tối đa 3.5 giờ' : 'Giới hạn 1.5 giờ'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Phân bổ Vận động thể chất</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {morningRecovery >= 75 ? 'Cường độ vừa – mạnh' : 'Đi bộ & giãn cơ nhẹ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cảm biến gia tốc 3 trục (Actigraphy) */}
      <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              Phân bổ Trạng thái Hoạt động 24h (Cảm biến Gia tốc 3 trục · Actigraphy)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theo dõi tự động cường độ vận động, học tập tĩnh tại và thời gian nghỉ ngơi
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5" /> Tổng chu kỳ: 24.0 giờ
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INITIAL_ACTIGRAPHY}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {INITIAL_ACTIGRAPHY.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} giờ`, 'Thời lượng']}
                  contentStyle={sharpTooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {INITIAL_ACTIGRAPHY.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-800 dark:text-white">
                    {item.hours}h
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {Math.round((item.hours / 24) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
