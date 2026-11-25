import {
  BellOff,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Wind,
  AlertTriangle,
  Users,
  Lock,
  Shield,
  Eye,
} from 'lucide-react';
import { formatClock } from '../utils/sleepCalculator';

// ============================================================================
// PHÂN HỆ E: BẢNG ĐIỀU KHIỂN 5 TÍNH NĂNG VƯỢT TRỘI TRÊN VÒNG TAY
// ============================================================================

export default function BandFeaturesTab({
  focusMode,
  onToggleFocusMode,
  focusSeconds,
  focusRunning,
  setFocusRunning,
  setFocusMode,
  setFocusSeconds,
  battery,
  liveHr,
  liveHrv,
  onOpenBreathing,
  isBurnoutSitting,
  sittingMinutes,
  sleepDeprived,
  onResetSitting,
  onOpenParentMode,
}) {
  return (
    <div className="space-y-6">
      {/* Thẻ 1: Chế độ tập trung học đường + Mô phỏng màn hình OLED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  Tính năng 01 · Zero-Distraction Mode
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                  Chế độ Tập trung Học đường
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tự động chặn toàn bộ thông báo mạng xã hội & tin nhắn gây xao nhãng. Màn hình vòng tay chuyển sang chế độ tối giản chỉ hiện giờ và nhịp thở.
                </p>
              </div>
              <button
                onClick={onToggleFocusMode}
                className={`relative w-14 h-8 rounded-none transition-colors shrink-0 border ${
                  focusMode
                    ? 'bg-blue-600 border-blue-700'
                    : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`}
                aria-label="Bật tắt Chế độ tập trung"
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-none bg-white shadow transition-transform ${
                    focusMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="mt-5 p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-none bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                  {focusMode ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Bộ đếm phiên tập trung (Pomodoro sinh học)
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-800 dark:text-white">
                    {formatClock(focusSeconds)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!focusMode) setFocusMode(true);
                    setFocusRunning(!focusRunning);
                  }}
                  className="px-4 py-2 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  {focusRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {focusRunning ? 'Tạm dừng' : 'Bắt đầu phiên'}
                </button>
                <button
                  onClick={() => {
                    setFocusRunning(false);
                    setFocusSeconds(25 * 60);
                  }}
                  className="p-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  aria-label="Đặt lại đồng hồ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mô phỏng mặt màn hình OLED của ChronoMind Band */}
        <div className="rounded-none bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">
            Mô phỏng màn hình ChronoMind Band
          </div>
          <div className="w-36 h-56 rounded-none bg-black border-[4px] border-slate-700 shadow-2xl p-4 flex flex-col items-center justify-between relative overflow-hidden">
            <div className="flex items-center justify-between w-full text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400" />
                {focusMode ? 'Tập trung' : 'Bình thường'}
              </span>
              <span>{battery}%</span>
            </div>

            <div className="my-auto flex flex-col items-center">
              <div className="text-3xl font-bold tracking-tight text-white font-mono">
                {focusMode ? formatClock(focusSeconds) : '10:31'}
              </div>
              <div className="mt-3 w-8 h-8 rounded-none bg-emerald-500/20 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-none bg-emerald-400 animate-ping" />
              </div>
              <span className="text-[10px] text-emerald-300 mt-2">
                {focusMode ? 'Nhịp thở đều · Chặn MXH' : `${liveHr} bpm · HRV ${liveHrv}`}
              </span>
            </div>

            <div className="text-[9px] text-slate-500">Zero-Distraction UI</div>
          </div>
        </div>
      </div>

      {/* Hàng 4 thẻ tính năng còn lại (02, 03, 04, 05) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-none bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                Tính năng 02 · Micro-Reset
              </span>
              <Wind className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-3">
              Điều hòa nhịp thở 60 giây & Reset cảm xúc vi mô
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Vòng tay rung nhẹ theo nhịp chuẩn 4s Hít vào – 4s Giữ hơi – 4s Thở ra giúp hạ nhịp tim và làm dịu hồi hộp ngay tại bàn học trước giờ kiểm tra.
            </p>
          </div>
          <button
            onClick={onOpenBreathing}
            className="mt-5 w-full py-3 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Khởi chạy bài tập 60 giây ngay
          </button>
        </div>

        <div
          className={`rounded-none border p-6 shadow-sm flex flex-col justify-between ${
            isBurnoutSitting
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-none bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                Tính năng 03 · Burnout Guard
              </span>
              <AlertTriangle
                className={`w-5 h-5 ${isBurnoutSitting ? 'text-amber-600 animate-bounce' : 'text-amber-500'}`}
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-3">
              Cảnh báo Ngưỡng Quá tải (Burnout Guard)
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Thời gian ngồi học liên tục
                  </span>
                  <span
                    className={`font-bold ${
                      isBurnoutSitting ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'
                    }`}
                  >
                    {sittingMinutes} / 60 phút
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-none bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-none transition-all duration-500 ${
                      isBurnoutSitting ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (sittingMinutes / 60) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-300">Tải tuần so với khả năng phục hồi:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {sleepDeprived ? '89% · Sát ngưỡng cảnh báo' : '74% · An toàn bền vững'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onResetSitting}
            className="mt-5 w-full py-2.5 rounded-none bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition"
          >
            {isBurnoutSitting ? 'Đứng dậy nghỉ 3 phút ngay (Đặt lại bộ đếm)' : 'Ghi nhận đứng dậy vươn vai'}
          </button>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-none bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                Tính năng 04 · Connection Nudge
              </span>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-3">
              Nhắc nhở "Khoảng lặng Gia đình & Bạn bè"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Các khối lịch dưới đây được khóa bảo vệ — AI không bao giờ chèn thêm bài tập vào giờ gắn kết.
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-3 rounded-none bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Lock className="w-3.5 h-3.5 text-orange-500" /> 19:00 – 20:00 · Bữa tối gia đình
                </div>
                <span className="text-orange-700 dark:text-orange-300 font-bold">Đã khóa</span>
              </div>
              <div className="p-3 rounded-none bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Lock className="w-3.5 h-3.5 text-orange-500" /> 17:15 – 18:15 · Cầu lông cùng bạn
                </div>
                <span className="text-orange-700 dark:text-orange-300 font-bold">Đã khóa</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Thời gian kết nối tuần này:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">8.5 / 10 giờ mục tiêu</span>
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-none bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                Tính năng 05 · Privacy-First Companion
              </span>
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-3">
              Chia sẻ Đồng hành Tôn trọng Quyền riêng tư
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Phụ huynh chỉ xem được <strong>Chỉ số hồi phục giấc ngủ</strong> và <strong>Mức độ cân bằng sinh hoạt</strong>. Nhật ký cảm xúc riêng tư của học sinh luôn được khóa bảo mật tuyệt đối.
            </p>
          </div>
          <button
            onClick={onOpenParentMode}
            className="mt-5 w-full py-3 rounded-none bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" /> Xem trước bản báo cáo gửi Phụ huynh
          </button>
        </div>
      </div>
    </div>
  );
}
