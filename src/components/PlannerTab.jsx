import {
  Sparkles,
  RotateCcw,
  Plus,
  CheckCircle2,
  Circle,
  Lock,
  Trash2,
  Target,
} from 'lucide-react';
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
import { CATEGORY_META } from '../data/mockData';
import { getGoalMetrics, formatMetricValue } from '../utils/goalScheduler';

// ============================================================================
// PHÂN HỆ C: LỊCH TRÌNH "THỜI ĐIỂM VÀNG" THEO NHỊP SINH HỌC
// ============================================================================

export default function PlannerTab({
  rebalancedInfo,
  onUndoRebalance,
  morningRecovery,
  plannerView,
  setPlannerView,
  energyCurveData,
  darkMode,
  sharpTooltipStyle,
  tasks,
  todayTasks,
  overallProgress,
  completedCount,
  showAddTask,
  setShowAddTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCategory,
  setNewTaskCategory,
  setNewTaskSubject,
  newTaskDay,
  setNewTaskDay,
  onAddTask,
  onToggleTaskDone,
  onDeleteTask,
  goals = [],
  onGoToGoals,
}) {
  return (
    <div className="space-y-6">
      {rebalancedInfo && (
        <div className="rounded-none p-4 sm:p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-none bg-emerald-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Lịch trình đã được làm dịu tự động lúc {rebalancedInfo.timestamp}
              </h4>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                Đã dời {rebalancedInfo.movedList.length} đầu việc linh hoạt sang Thứ 5 & Thứ 6 và chèn 30 phút nghỉ phục hồi vào hôm nay. Mục tiêu ôn thi học kỳ của bạn vẫn giữ vững tiến độ 100%!
              </p>
            </div>
          </div>
          <button
            onClick={onUndoRebalance}
            className="shrink-0 px-3.5 py-2 rounded-none bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 transition inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Hoàn tác
          </button>
        </div>
      )}

      {/* Biểu đồ Đường cong Năng lượng Sinh học */}
      <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Đường cong Năng lượng Sinh học & Khung giờ Vàng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tự động đồng bộ theo Điểm hồi phục buổi sáng ({morningRecovery}/100) để phân bổ môn học tối ưu
            </p>
          </div>

          <div className="inline-flex p-1 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
            {[
              { id: 'day', label: 'Ngày' },
              { id: 'week', label: 'Tuần' },
              { id: 'month', label: 'Tháng' },
              { id: 'semester', label: 'Học kỳ' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setPlannerView(v.id)}
                className={`px-3.5 py-1.5 rounded-none text-xs font-semibold transition ${
                  plannerView === v.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyCurveData} margin={{ top: 18, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="energyBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: darkMode ? '#94A3B8' : '#64748B' }} />
              <YAxis domain={[0, 105]} tick={{ fontSize: 11, fill: darkMode ? '#94A3B8' : '#64748B' }} />
              <Tooltip contentStyle={sharpTooltipStyle} />
              <ReferenceArea
                x1="07:30"
                x2="10:30"
                fill="#2563EB"
                fillOpacity={0.12}
                label={{ value: 'Logic đỉnh cao', position: 'insideTop', fill: '#2563EB', fontSize: 11, fontWeight: 600 }}
              />
              <ReferenceArea
                x1="15:00"
                x2="16:30"
                fill="#8B5CF6"
                fillOpacity={0.14}
                label={{ value: 'Sáng tạo', position: 'insideTop', fill: '#7C3AED', fontSize: 11, fontWeight: 600 }}
              />
              <ReferenceArea
                x1="18:00"
                x2="19:30"
                fill="#F59E0B"
                fillOpacity={0.14}
                label={{ value: 'Vận động & Gia đình', position: 'insideTop', fill: '#D97706', fontSize: 11, fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="energy"
                name="Năng lượng sinh học (%)"
                stroke="#2563EB"
                strokeWidth={2.8}
                fill="url(#energyBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Nhãn màu thời điểm vàng */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-none bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <span className="w-2.5 h-2.5 bg-blue-600" /> 08:00 – 11:30 · Tư duy logic đỉnh cao
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Toán, Vật Lý, Hóa học, giải đề phân tích sâu
            </p>
          </div>
          <div className="p-3 rounded-none bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <span className="w-2.5 h-2.5 bg-purple-500" /> 14:30 – 16:45 · Ghi nhớ & Sáng tạo
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Ngữ văn, Lịch sử, Địa lý, Ngoại ngữ, sơ đồ tư duy
            </p>
          </div>
          <div className="p-3 rounded-none bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="w-2.5 h-2.5 bg-amber-500" /> 17:00 – 20:00 · Vận động & Gắn kết
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Thể thao giải tỏa cortisol, ăn tối & trò chuyện cùng gia đình
            </p>
          </div>
        </div>
      </div>

      {/* Khu vực nội dung theo chế độ xem Ngày / Tuần / Tháng / Học kỳ */}
      {plannerView === 'day' && (
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Thời gian biểu Cá nhân hóa · Hôm nay ({todayTasks.length} đầu việc)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tiến độ hoàn thành tổng thể: {overallProgress}% ({completedCount}/{tasks.length} mục tiêu tuần)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start">
              {onGoToGoals && (
                <button
                  onClick={onGoToGoals}
                  className="px-3.5 py-2.5 rounded-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Điều chỉnh mục tiêu ({goals.length})
                </button>
              )}
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="px-4 py-2.5 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Thêm đầu việc mới
              </button>
            </div>
          </div>

          {showAddTask && (
            <form
              onSubmit={onAddTask}
              className="mb-5 p-4 rounded-none bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            >
              <input
                type="text"
                placeholder="VD: Ôn tập công thức Lượng giác..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="lg:col-span-2 px-3.5 py-2 rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => {
                  const cat = e.target.value;
                  setNewTaskCategory(cat);
                  setNewTaskSubject(
                    cat === 'logic' ? 'Toán học' : cat === 'creative' ? 'Ngữ văn / Anh' : 'Vận động'
                  );
                }}
                className="px-3 py-2 rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="logic">Tư duy logic (Toán, Lý, Hóa)</option>
                <option value="creative">Ghi nhớ & Sáng tạo (Văn, Sử, Anh)</option>
                <option value="active">Vận động & Gắn kết</option>
              </select>
              <select
                value={newTaskDay}
                onChange={(e) => setNewTaskDay(e.target.value)}
                className="px-3 py-2 rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="Hôm nay">Hôm nay</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
              >
                Tự xếp giờ vàng
              </button>
            </form>
          )}

          <div className="space-y-3">
            {todayTasks.map((task) => {
              const meta = CATEGORY_META[task.category] || CATEGORY_META.logic;
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-none border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.isAutoAdded
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : task.completed
                      ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => onToggleTaskDone(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                      aria-label="Đánh dấu hoàn thành"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {task.timeSlot}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-none text-[11px] font-semibold border ${meta.badge}`}
                        >
                          {meta.short}
                        </span>
                        {task.isGoalGenerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                            <Target className="w-3 h-3" /> Từ mục tiêu
                          </span>
                        )}
                        {task.protected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-medium bg-amber-100/80 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                            <Lock className="w-3 h-3" /> Khóa bảo vệ
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-sm font-semibold mt-1 ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-400 font-medium">{task.duration}p</span>
                    {!task.protected && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-none text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        aria-label="Xóa đầu việc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plannerView === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {['Hôm nay', 'Thứ 4', 'Thứ 5', 'Thứ 6'].map((day) => {
            const dayList = tasks.filter((t) => t.day === day);
            return (
              <div
                key={day}
                className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{day}</h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {dayList.length} việc
                  </span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {dayList.map((t) => {
                    const meta = CATEGORY_META[t.category] || CATEGORY_META.logic;
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-none border text-xs ${
                          t.rescheduled
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            {t.timeSlot}
                          </span>
                          <span className={`w-2 h-2 ${meta.dot}`} />
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                          {t.title}
                        </div>
                        {t.rescheduled && (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <Sparkles className="w-3 h-3" /> AI vừa cân bằng sang đây
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {plannerView === 'month' && (
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Bản đồ Nhịp sinh học & Tải học tập · Tháng 11
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các ngày màu xanh ngọc thể hiện sự cân bằng tốt giữa ôn thi và phục hồi giấc ngủ
              </p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <div key={d} className="text-xs font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === 24;
              const tone =
                dayNum % 7 === 0
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                  : dayNum === 14 || dayNum === 21
                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 text-purple-800 dark:text-purple-300'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300';
              return (
                <div
                  key={dayNum}
                  className={`p-2.5 sm:p-3 rounded-none border text-xs font-semibold transition ${tone} ${
                    isToday ? 'ring-2 ring-blue-600 shadow-sm' : ''
                  }`}
                >
                  <div>{dayNum}</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5 hidden sm:block">
                    {isToday ? 'Hôm nay' : dayNum % 7 === 0 ? 'Gia đình' : 'Cân bằng'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plannerView === 'semester' && (
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Lộ trình Mục tiêu Dài hạn & Chỉ số Học kỳ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đồng bộ trực tiếp từ trang Mục tiêu & Chỉ số để chia nhỏ khối lượng ôn thi bền vững theo nhịp sinh học
              </p>
            </div>
            {onGoToGoals && (
              <button
                onClick={onGoToGoals}
                className="px-3.5 py-2 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 self-start"
              >
                <Target className="w-3.5 h-3.5" /> Quản lý mục tiêu số
              </button>
            )}
          </div>
          <div className="space-y-4">
            {goals.map((goal) => {
              const metrics = getGoalMetrics(goal);
              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {goal.title} · <span className="text-slate-500 dark:text-slate-400 font-medium">{goal.subject}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatMetricValue(metrics.current)} / {formatMetricValue(metrics.target)} {goal.unit}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">Mốc: {goal.deadline}</span>
                      <span className="px-2.5 py-0.5 rounded-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {goal.autoSync ? `${goal.sessionsPerWeek} buổi/tuần` : 'Tạm tắt lịch'}
                      </span>
                      <span className="font-bold" style={{ color: metrics.color }}>
                        {metrics.progressPct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-none bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-none transition-all duration-700"
                      style={{ width: `${metrics.progressPct}%`, backgroundColor: metrics.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
