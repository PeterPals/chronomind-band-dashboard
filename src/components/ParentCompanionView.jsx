import { Shield, Moon, HeartHandshake, Lock } from 'lucide-react';
import RecoveryGauge from './RecoveryGauge';

// ============================================================================
// GIAO DIỆN CHẾ ĐỘ PHỤ HUYNH (TÔN TRỌNG QUYỀN RIÊNG TƯ HỌC SINH)
// ============================================================================

export default function ParentCompanionView({
  morningRecovery,
  sleepDeprived,
  darkMode,
  onExitParentMode,
}) {
  return (
    <div className="space-y-6">
      {/* Banner giải thích chế độ đồng hành */}
      <div className="rounded-none p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-blue-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-none bg-emerald-600 text-white shadow-sm shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Chế độ Phụ huynh · Đồng hành tôn trọng quyền riêng tư
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-1">
                Bản tóm tắt sức khỏe sinh học của Châu Anh
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                Phụ huynh nắm bắt kịp thời chất lượng giấc ngủ và nhịp sinh hoạt cân bằng của con để đồng hành nhẹ nhàng, trong khi không gian cảm xúc riêng tư của học sinh vẫn được bảo vệ tuyệt đối.
              </p>
            </div>
          </div>
          <button
            onClick={onExitParentMode}
            className="shrink-0 px-4 py-2.5 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            Quay về Góc nhìn Học sinh
          </button>
        </div>
      </div>

      {/* 2 Chỉ số công khai cho Phụ huynh */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
                Chỉ số chia sẻ #1
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Chỉ số Hồi phục Giấc ngủ
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300">
              <Moon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <RecoveryGauge score={morningRecovery} darkMode={darkMode} />
            <div className="space-y-3 flex-1">
              <div className="p-3.5 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Thời lượng ngủ đêm qua</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {sleepDeprived ? '5 giờ 10 phút (Thiếu ngủ nhẹ)' : '7 giờ 30 phút (Đủ 5 chu kỳ)'}
                </div>
              </div>
              <div className="p-3.5 rounded-none bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Gợi ý đồng hành dành cho ba mẹ
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {sleepDeprived
                    ? 'Đêm qua con ngủ hơi muộn. Tối nay gia đình có thể cùng con ăn nhẹ ấm bụng và hạn chế nhắc về áp lực bài vở trước 22h nhé.'
                    : 'Nhịp ngủ của con tuần này rất ổn định. Một lời khen nhẹ nhàng cho thói quen ngủ đúng giờ sẽ tiếp thêm động lực lớn cho con.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                Chỉ số chia sẻ #2
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Mức độ Cân bằng Sinh hoạt
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Cân bằng Học tập – Nghỉ ngơi
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {sleepDeprived ? '72% · Đang điều chỉnh nhẹ' : '91% · Rất hài hòa'}
                </span>
              </div>
              <div className="w-full h-3 rounded-none bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-none bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: sleepDeprived ? '72%' : '91%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-none bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Vận động thể chất hôm nay
                </div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  84 phút
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Đạt 100% mục tiêu
                </div>
              </div>
              <div className="p-3.5 rounded-none bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Khoảng lặng cùng gia đình
                </div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  8.5 giờ / tuần
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Đã khóa lịch ăn tối 19:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khu vực ĐÃ KHÓA QUYỀN RIÊNG TƯ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'Nhật ký cảm xúc riêng tư',
            desc: 'Ghi chép tâm sự và chi tiết cảm xúc hằng ngày của học sinh được mã hóa cục bộ.',
          },
          {
            title: 'Chi tiết đối thoại Trợ lý Tinh thần AI',
            desc: 'Không gian tâm lý an toàn không bị giám sát giúp học sinh thoải mái chia sẻ áp lực.',
          },
          {
            title: 'Chi tiết điểm số & tiến độ từng môn',
            desc: 'ChronoMind tập trung vào sức khỏe bền vững, không biến vòng tay thành công cụ giám sát điểm số.',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-none bg-slate-100/80 dark:bg-slate-900/80 border border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-none bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-none text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
              Đã khóa bảo mật riêng tư
            </span>
            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
