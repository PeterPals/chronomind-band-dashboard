import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Pencil,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  RefreshCw,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CATEGORY_META, GOAL_PRESETS } from '../data/mockData';
import { computeGoalPlans, formatMetricValue } from '../utils/goalScheduler';

// ============================================================================
// PHÂN HỆ MỤC TIÊU CHI TIẾT & ĐỒNG BỘ LỊCH TRÌNH THEO CHỈ SỐ SỐ HỌC
// ============================================================================

const EMPTY_FORM = {
  title: '',
  subject: 'SAT',
  category: 'logic',
  baselineValue: 0,
  currentValue: 0,
  targetValue: 100,
  unit: 'điểm',
  stepSize: 5,
  cadence: 'milestone',
  deadline: '2026-12-20',
  sessionMinutes: 60,
  sessionsPerWeek: 4,
  priority: 'high',
  autoSync: true,
  notes: '',
};

const PRIORITY_META = {
  high: {
    label: 'Ưu tiên cao',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  medium: {
    label: 'Ưu tiên vừa',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  low: {
    label: 'Linh hoạt',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
};

const CADENCE_LABELS = {
  daily: 'Hằng ngày',
  weekly: 'Theo tuần',
  milestone: 'Mốc kỳ thi',
};

export default function GoalsTab({
  goals,
  tasks,
  morningRecovery,
  sleepDeprived,
  darkMode,
  sharpTooltipStyle,
  onSaveGoal,
  onUpdateGoalProgress,
  onToggleGoalSync,
  onDeleteGoal,
  onResyncSchedule,
  onGoToPlanner,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState('all');
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineValue, setInlineValue] = useState('');

  const plans = useMemo(
    () => computeGoalPlans(goals, morningRecovery, sleepDeprived),
    [goals, morningRecovery, sleepDeprived]
  );

  const filteredPlans = useMemo(() => {
    if (filterCategory === 'all') return plans;
    return plans.filter((p) => p.goal.category === filterCategory);
  }, [plans, filterCategory]);

  const activeSyncCount = goals.filter((g) => g.autoSync).length;
  const achievedCount = plans.filter((p) => p.metrics.isAchieved).length;
  const avgProgress =
    plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.metrics.progressPct, 0) / plans.length)
      : 0;
  const totalWeeklyMinutes = plans.reduce((sum, p) => sum + p.weeklyMinutes, 0);
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  const todayGoalTasks = useMemo(
    () => tasks.filter((t) => t.day === 'Hôm nay' && t.isGoalGenerated),
    [tasks]
  );
  const todayGoalMinutes = todayGoalTasks.reduce((sum, t) => sum + t.duration, 0);

  // Dữ liệu biểu đồ phân bổ phút theo ngày & nhóm thời điểm vàng
  const weeklyChartData = useMemo(() => {
    const days = ['Hôm nay', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
    return days.map((day) => {
      const dayGoalTasks = tasks.filter((t) => t.day === day && t.isGoalGenerated);
      const sumByCat = (cat) =>
        dayGoalTasks
          .filter((t) => t.category === cat)
          .reduce((acc, t) => acc + t.duration, 0);
      return {
        day,
        logic: sumByCat('logic'),
        creative: sumByCat('creative'),
        active: sumByCat('active'),
      };
    });
  }, [tasks]);

  const openCreateForm = () => {
    setEditingGoalId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (goal) => {
    setEditingGoalId(goal.id);
    setForm({
      title: goal.title,
      subject: goal.subject,
      category: goal.category,
      baselineValue: goal.baselineValue ?? 0,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      stepSize: goal.stepSize ?? 1,
      cadence: goal.cadence,
      deadline: goal.deadline,
      sessionMinutes: goal.sessionMinutes,
      sessionsPerWeek: goal.sessionsPerWeek,
      priority: goal.priority,
      autoSync: goal.autoSync,
      notes: goal.notes || '',
    });
    setShowForm(true);
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      title: preset.title,
      subject: preset.subject,
      category: preset.category,
      baselineValue: preset.baselineValue,
      currentValue: preset.currentValue,
      targetValue: preset.targetValue,
      unit: preset.unit,
      stepSize: preset.stepSize,
      cadence: preset.cadence,
      deadline: preset.deadline,
      sessionMinutes: preset.sessionMinutes,
      sessionsPerWeek: preset.sessionsPerWeek,
      priority: preset.priority,
      notes: preset.notes,
      autoSync: true,
    }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const targetNum = Number(form.targetValue);
    if (!Number.isFinite(targetNum) || targetNum <= 0) return;

    const payload = {
      ...form,
      id: editingGoalId || `goal-${Date.now()}`,
      title: form.title.trim(),
      subject: form.subject.trim() || 'Tổng hợp',
      unit: form.unit.trim() || 'đơn vị',
      baselineValue: Number(form.baselineValue) || 0,
      currentValue: Math.max(0, Number(form.currentValue) || 0),
      targetValue: targetNum,
      stepSize: Math.max(0.05, Number(form.stepSize) || 1),
      sessionMinutes: Math.max(15, Math.min(180, Number(form.sessionMinutes) || 45)),
      sessionsPerWeek:
        form.cadence === 'daily'
          ? 7
          : Math.max(1, Math.min(7, Number(form.sessionsPerWeek) || 3)),
      deadline: form.cadence === 'daily' ? 'Hằng ngày' : form.deadline || 'Cuối kỳ',
    };

    onSaveGoal(payload, Boolean(editingGoalId));
    setShowForm(false);
    setEditingGoalId(null);
    setForm(EMPTY_FORM);
  };

  const formGapPreview = Math.max(
    0,
    Number(((Number(form.targetValue) || 0) - (Number(form.currentValue) || 0)).toFixed(2))
  );
  const formWeeklyHoursPreview = (
    ((form.cadence === 'daily' ? 7 : Number(form.sessionsPerWeek) || 1) *
      (Number(form.sessionMinutes) || 45)) /
    60
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Banner đầu trang: Kết nối Mục tiêu Số học <-> Lịch Thời điểm vàng */}
      <div className="rounded-none p-5 sm:p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-none bg-blue-600 text-white shadow-sm shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5" /> Mục tiêu định lượng · Tự động xếp lịch thông minh
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Thiết lập Mục tiêu & Chỉ số Cụ thể
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
              Nhập chính xác con số bạn muốn chinh phục. ChronoMind tự tính khoảng cách còn thiếu và điều chỉnh khối học/vận động vào đúng Khung giờ Vàng theo Điểm hồi phục ({morningRecovery}/100).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={openCreateForm}
            className="px-4 py-2.5 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm mục tiêu mới
          </button>
          <button
            onClick={onGoToPlanner}
            className="px-4 py-2.5 rounded-none bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Xem lịch đã xếp
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>MỤC TIÊU ĐANG THEO DÕI</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {goals.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              · {activeSyncCount} đồng bộ lịch
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đã chạm mốc: {achievedCount}/{goals.length} mục tiêu
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>TIẾN ĐỘ TRUNG BÌNH</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {avgProgress}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              hoàn thành
            </span>
          </div>
          <div className="w-full h-2 rounded-none bg-slate-100 dark:bg-slate-800 mt-2.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>QUỸ THỜI GIAN MỤC TIÊU</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalWeeklyHours} giờ
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              / tuần
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hôm nay đã xếp: {todayGoalMinutes} phút ({todayGoalTasks.length} khối)
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>ĐIỀU TIẾT SINH HỌC</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-lg font-extrabold ${
                sleepDeprived || morningRecovery < 65
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {sleepDeprived || morningRecovery < 65 ? 'Đang giảm tải 25%' : 'Nhịp tối ưu 100%'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hồi phục {morningRecovery}/100 · Tự điều chỉnh độ dài buổi học
          </div>
        </div>
      </div>

      {/* Form Thêm / Chỉnh sửa Mục tiêu Chi tiết */}
      {showForm && (
        <form
          onSubmit={handleSubmitForm}
          className="rounded-none bg-white dark:bg-slate-900 border-2 border-blue-500/70 dark:border-blue-600 p-6 shadow-md space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {editingGoalId ? 'Chỉnh sửa Mục tiêu & Chỉ số' : 'Tạo Mục tiêu Định lượng Mới'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chọn mẫu nhanh hoặc điền thông số chi tiết để ChronoMind tự tính lịch trình phù hợp
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Mẫu nhanh:</span>
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-none bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Tên mục tiêu cụ thể *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Đạt SAT 1560, 8.0 điểm Toán, Chạy bộ 2km mỗi ngày..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Môn học / Lĩnh vực
              </label>
              <input
                type="text"
                placeholder="VD: SAT, Toán học, Thể chất"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Khung giờ vàng sinh học
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="logic">Tư duy logic (08:00 – 11:30)</option>
                <option value="creative">Ghi nhớ & Sáng tạo (14:30 – 16:45)</option>
                <option value="active">Vận động & Thể chất (17:00 – 19:00)</option>
                <option value="recovery">Phục hồi & Thư giãn (12:30 / 21:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Mốc xuất phát (tùy chọn)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.baselineValue}
                onChange={(e) => setForm({ ...form, baselineValue: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Chỉ số hiện tại *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-blue-600 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Con số mục tiêu cần đạt *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Đơn vị
                </label>
                <input
                  type="text"
                  placeholder="điểm, km..."
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Bước tăng (+/-)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.05"
                  value={form.stepSize}
                  onChange={(e) => setForm({ ...form, stepSize: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Tần suất thực hiện
              </label>
              <select
                value={form.cadence}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cadence: e.target.value,
                    sessionsPerWeek: e.target.value === 'daily' ? 7 : form.sessionsPerWeek,
                  })
                }
                className="w-full px-3 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="milestone">Mốc kỳ thi / Dài hạn</option>
                <option value="weekly">Mục tiêu theo tuần</option>
                <option value="daily">Thói quen hằng ngày</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Thời lượng mỗi buổi (phút)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                step="5"
                value={form.sessionMinutes}
                onChange={(e) => setForm({ ...form, sessionMinutes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Số buổi / tuần
              </label>
              <input
                type="number"
                min="1"
                max="7"
                disabled={form.cadence === 'daily'}
                value={form.cadence === 'daily' ? 7 : form.sessionsPerWeek}
                onChange={(e) => setForm({ ...form, sessionsPerWeek: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Ưu tiên
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                >
                  <option value="high">Cao</option>
                  <option value="medium">Vừa</option>
                  <option value="low">Linh hoạt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Hạn đạt mốc
                </label>
                <input
                  type={form.cadence === 'daily' ? 'text' : 'date'}
                  disabled={form.cadence === 'daily'}
                  value={form.cadence === 'daily' ? 'Hằng ngày' : form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Chiến lược & ghi chú chi tiết
              </label>
              <input
                type="text"
                placeholder="VD: Chia 30p làm đề bấm giờ + 30p phân tích lỗi sai..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-none bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoSync}
                onChange={(e) => setForm({ ...form, autoSync: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              <span>Tự động xếp & điều chỉnh lịch trình dựa trên mục tiêu này</span>
            </label>
            <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold">
              Còn thiếu: {formatMetricValue(formGapPreview)} {form.unit || 'đơn vị'} · Dự kiến phân bổ{' '}
              {formWeeklyHoursPreview} giờ/tuần vào khung{' '}
              {(CATEGORY_META[form.category] || CATEGORY_META.logic).defaultSlot}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingGoalId(null);
              }}
              className="px-4 py-2.5 rounded-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingGoalId ? 'Lưu & cập nhật lịch' : 'Lưu mục tiêu & xếp lịch'}
            </button>
          </div>
        </form>
      )}

      {/* Thanh lọc & nút đồng bộ lại */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Tất cả (${goals.length})` },
            { id: 'logic', label: 'Tư duy logic' },
            { id: 'creative', label: 'Ghi nhớ & Sáng tạo' },
            { id: 'active', label: 'Vận động & Thể chất' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-2 rounded-none text-xs font-semibold border transition ${
                filterCategory === tab.id
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onResyncSchedule}
          className="px-3.5 py-2 rounded-none bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition inline-flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Tái tối ưu lịch theo chỉ số hiện tại
        </button>
      </div>

      {/* Danh sách Thẻ Mục tiêu Định lượng Chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPlans.map(({ goal, metrics, plannedDays, adjustedDuration, weeklyMinutes, adaptiveNote }) => {
          const catMeta = CATEGORY_META[goal.category] || CATEGORY_META.logic;
          const priMeta = PRIORITY_META[goal.priority] || PRIORITY_META.medium;
          const isEditingInline = inlineEditId === goal.id;

          return (
            <div
              key={goal.id}
              className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                {/* Nhãn danh mục, ưu tiên, hạn mốc */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-none text-[11px] font-semibold border ${catMeta.badge}`}>
                      {catMeta.short}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-none text-[11px] font-semibold border ${priMeta.badge}`}>
                      {priMeta.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-none text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {CADENCE_LABELS[goal.cadence] || goal.cadence} · {goal.deadline}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(goal)}
                      className="p-1.5 rounded-none text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Chỉnh sửa mục tiêu"
                      aria-label="Chỉnh sửa mục tiêu"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Xóa mục tiêu"
                      aria-label="Xóa mục tiêu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tên mục tiêu & ghi chú */}
                <div className="mt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {goal.subject}
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {goal.title}
                  </h4>
                  {goal.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Khối chỉ số định lượng & nút cập nhật nhanh */}
                <div className="mt-4 p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Tiến độ chỉ số
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {formatMetricValue(metrics.current)}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                          / {formatMetricValue(metrics.target)} {goal.unit}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="text-xl font-extrabold"
                        style={{ color: metrics.color }}
                      >
                        {metrics.progressPct}%
                      </span>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {metrics.isAchieved
                          ? 'Đã đạt mục tiêu!'
                          : `Còn thiếu ${formatMetricValue(metrics.remaining)} ${goal.unit}`}
                      </div>
                    </div>
                  </div>

                  {/* Thanh tiến độ */}
                  <div className="w-full h-2.5 rounded-none bg-slate-200 dark:bg-slate-700 mt-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${metrics.progressPct}%`, backgroundColor: metrics.color }}
                    />
                  </div>

                  {/* Cập nhật nhanh số liệu */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateGoalProgress(
                            goal.id,
                            Math.max(0, Number((metrics.current - (goal.stepSize || 1)).toFixed(2)))
                          )
                        }
                        className="px-2.5 py-1 rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                      >
                        <Minus className="w-3 h-3" /> {formatMetricValue(goal.stepSize || 1)}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateGoalProgress(
                            goal.id,
                            Number((metrics.current + (goal.stepSize || 1)).toFixed(2))
                          )
                        }
                        className="px-2.5 py-1 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> {formatMetricValue(goal.stepSize || 1)} {goal.unit}
                      </button>
                    </div>

                    {isEditingInline ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const parsed = Number(inlineValue);
                          if (Number.isFinite(parsed) && parsed >= 0) {
                            onUpdateGoalProgress(goal.id, parsed);
                          }
                          setInlineEditId(null);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="number"
                          step="any"
                          min="0"
                          autoFocus
                          value={inlineValue}
                          onChange={(e) => setInlineValue(e.target.value)}
                          className="w-24 px-2 py-1 rounded-none bg-white dark:bg-slate-900 border border-blue-500 text-xs font-bold text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded-none bg-blue-600 text-white text-xs font-semibold"
                        >
                          Lưu
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInlineEditId(goal.id);
                          setInlineValue(String(metrics.current));
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" /> Nhập số mới
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Khối trạng thái phân bổ vào Lịch Thời điểm vàng */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{adaptiveNote}</span>
                  </div>
                  {goal.autoSync ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Đã xếp: <span className="font-semibold text-slate-700 dark:text-slate-300">{plannedDays.join(', ')}</span> ·{' '}
                      {adjustedDuration}p/buổi ({Math.round(weeklyMinutes / 60 * 10) / 10}h/tuần) · Khung {catMeta.defaultSlot}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">
                      Bật đồng bộ để tự động thêm vào Thời gian biểu
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleGoalSync(goal.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-none text-[11px] font-semibold border transition ${
                    goal.autoSync
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {goal.autoSync ? 'Đang đồng bộ lịch' : 'Đã tắt đồng bộ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khu vực Biểu đồ phân bổ thời gian & Khối việc hôm nay từ Mục tiêu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              Phân bổ Quỹ thời gian Mục tiêu theo Ngày (phút)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lịch học & rèn luyện thể chất tự động cân đối theo từng nhóm Khung giờ Vàng
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: darkMode ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#94A3B8' : '#64748B' }} />
                <Tooltip contentStyle={sharpTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="logic" name="Tư duy logic (phút)" stackId="a" fill="#2563EB" />
                <Bar dataKey="creative" name="Ghi nhớ & Sáng tạo (phút)" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="active" name="Vận động & Thể chất (phút)" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Lịch Hôm nay sinh từ Mục tiêu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tổng cộng {todayGoalTasks.length} phiên ({todayGoalMinutes} phút) đã chèn vào Lịch Thời điểm vàng
            </p>

            <div className="mt-4 space-y-2.5">
              {todayGoalTasks.length === 0 ? (
                <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  Chưa có mục tiêu nào bật đồng bộ cho hôm nay.
                </div>
              ) : (
                todayGoalTasks.map((t) => {
                  const meta = CATEGORY_META[t.category] || CATEGORY_META.logic;
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">
                          {t.timeSlot}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {t.duration}p
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 mt-1">
                        {t.title}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className={`w-2 h-2 ${meta.dot}`} />
                        {meta.short}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={onGoToPlanner}
            className="mt-5 w-full py-2.5 px-4 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition inline-flex items-center justify-center gap-1.5"
          >
            Mở Lịch Thời điểm vàng <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
