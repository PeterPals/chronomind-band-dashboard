import { HeartHandshake, Sparkles, ArrowRight, Lock, Wind } from 'lucide-react';
import { MOOD_OPTIONS } from '../data/mockData';

// ============================================================================
// PHÂN HỆ D: TRỢ LÝ TINH THẦN & AUTO-REBALANCE (AI MOOD REBALANCER)
// ============================================================================

export default function MoodTab({
  selectedMood,
  setSelectedMood,
  currentMoodObj,
  onAutoRebalance,
  rebalancedInfo,
  onGoToPlanner,
  privateJournal,
  setPrivateJournal,
  liveHrv,
  onOpenBreathing,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <HeartHandshake className="w-3.5 h-3.5" /> Check-in cảm xúc hằng ngày
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
              Hôm nay tâm trạng của Ngọc Phan Châu Anh thế nào?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mọi cảm xúc đều được lắng nghe không phán xét và hoàn toàn bảo mật riêng tư.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {MOOD_OPTIONS.map((mood) => {
              const IconComp = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-3.5 rounded-none border text-left sm:text-center flex sm:flex-col items-center gap-3 sm:gap-2 transition ${
                    isSelected
                      ? `${mood.bg} ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-slate-900 shadow-sm`
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className={`w-6 h-6 shrink-0 ${mood.color}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                    {mood.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phản hồi đồng cảm + Nút Auto-Rebalance cốt lõi */}
          <div className={`p-5 rounded-none border ${currentMoodObj.bg} transition-all`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Trợ lý Tinh thần ChronoMind đồng hành
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1 leading-relaxed">
                  {currentMoodObj.advice}
                </p>
              </div>
              <button
                onClick={() => {
                  onAutoRebalance(`trạng thái "${currentMoodObj.label}"`);
                }}
                className={`shrink-0 px-5 py-3 rounded-none font-semibold text-sm transition shadow-sm inline-flex items-center justify-center gap-2 ${
                  currentMoodObj.needsRebalance
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Cân bằng lại lịch trình
              </button>
            </div>

            {rebalancedInfo && (
              <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Đã dời {rebalancedInfo.movedList.length} bài tập linh hoạt sang Thứ 5 & Thứ 6 · Đã chèn 30 phút nghỉ phục hồi vào hôm nay.
                </div>
                <button
                  onClick={onGoToPlanner}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  Xem lịch vừa cập nhật <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Nhật ký cảm xúc riêng tư */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Nhật ký cảm xúc riêng tư (Ẩn hoàn toàn trong Chế độ Phụ huynh)
              </label>
              <span className="text-[11px] text-slate-400">Tự động lưu cục bộ</span>
            </div>
            <textarea
              rows={3}
              value={privateJournal}
              onChange={(e) => setPrivateJournal(e.target.value)}
              className="w-full p-3.5 rounded-none bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Viết vài dòng để giải tỏa suy nghĩ trong đầu bạn lúc này..."
            />
          </div>
        </div>

        {/* Đối chiếu Tâm trạng & Chỉ số căng thẳng HRV */}
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Đối chiếu Cảm xúc & Sinh học HRV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kết hợp cảm nhận chủ quan với dữ liệu hệ thần kinh tự chủ từ vòng tay
            </p>

            <div className="mt-5 space-y-3">
              <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Chỉ số căng thẳng HRV</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {liveHrv} ms
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-none ${
                      liveHrv >= 55
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {liveHrv >= 55 ? 'Căng thẳng thấp' : 'Đang chịu áp lực'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Độ đồng bộ Tâm – Thể</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {currentMoodObj.needsRebalance || liveHrv < 50
                    ? 'Cả tâm lý và tín hiệu HRV đều cho thấy bạn cần một khoảng thở ngắn. Giảm 20% khối lượng hôm nay giúp hiệu suất ngày mai tăng lại rõ rệt.'
                    : 'Tâm trạng ổn định khớp rất tốt với chỉ số HRV khỏe mạnh. Bạn đang duy trì nhịp học tập bền vững!'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenBreathing}
            className="w-full py-3 rounded-none bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition flex items-center justify-center gap-2"
          >
            <Wind className="w-4 h-4" />
            Thử bài tập Reset cảm xúc 60 giây
          </button>
        </div>
      </div>
    </div>
  );
}
