import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Heart,
  Moon,
  Sun,
  Calendar,
  Brain,
  Shield,
  Bluetooth,
  Battery,
  BellOff,
  Bell,
  AlertTriangle,
  Menu,
  X,
  RotateCcw,
  Watch,
  Radio,
  Check,
  Target,
} from 'lucide-react';
import {
  INITIAL_PPG_DATA,
  SLEEP_DEPRIVED_PPG_DATA,
  NORMAL_SLEEP_HYPNOGRAM,
  SHORT_SLEEP_HYPNOGRAM,
  BASE_ENERGY_CURVE,
  INITIAL_TASKS,
  INITIAL_GOALS,
  MOOD_OPTIONS,
  CATEGORY_META,
} from './data/mockData';
import { calculateSmartWakeWindow, getSharpTooltipStyle } from './utils/sleepCalculator';
import { syncGoalsToTasks, formatMetricValue } from './utils/goalScheduler';
import BreathingModal from './components/BreathingModal';
import ParentCompanionView from './components/ParentCompanionView';
import BiometricsTab from './components/BiometricsTab';
import SleepTab from './components/SleepTab';
import PlannerTab from './components/PlannerTab';
import GoalsTab from './components/GoalsTab';
import MoodTab from './components/MoodTab';
import BandFeaturesTab from './components/BandFeaturesTab';

// ============================================================================
// COMPONENT CHÍNH: CHRONOMIND BAND DASHBOARD
// ============================================================================

export default function App() {
  // Giao diện & điều hướng
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('biometrics'); // biometrics | sleep | planner | mood | band
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parentMode, setParentMode] = useState(false);

  // Trạng thái Vòng tay & Chỉ số sinh học trực tiếp
  const [battery] = useState(86);
  const [focusMode, setFocusMode] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);

  const [liveHr, setLiveHr] = useState(71);
  const [liveHrv, setLiveHrv] = useState(66);
  const [liveSpo2, setLiveSpo2] = useState(99);
  const [morningRecovery, setMorningRecovery] = useState(84);
  const [sittingMinutes, setSittingMinutes] = useState(42);
  const [sleepDeprived, setSleepDeprived] = useState(false);

  // Phân hệ B: Anti-Sleep Inertia Inputs
  const [bedTime, setBedTime] = useState('22:30');
  const [maxWakeTime, setMaxWakeTime] = useState('06:30');
  const [tomorrowPriority, setTomorrowPriority] = useState('normal'); // light | normal | high

  // Phân hệ C: Lịch trình Golden Hours & Mục tiêu Định lượng
  const [plannerView, setPlannerView] = useState('day'); // day | week | month | semester
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [tasks, setTasks] = useState(
    () => syncGoalsToTasks(INITIAL_TASKS, INITIAL_GOALS, 84, false).updatedTasks
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Toán học');
  const [newTaskCategory, setNewTaskCategory] = useState('logic');
  const [newTaskDay, setNewTaskDay] = useState('Hôm nay');
  const [showAddTask, setShowAddTask] = useState(false);

  // Phân hệ D: Cảm xúc & Auto-Rebalance
  const [selectedMood, setSelectedMood] = useState('stable');
  const [privateJournal, setPrivateJournal] = useState(
    'Hôm nay mình hơi hồi hộp với bài kiểm tra 1 tiết Vật Lý ngày mai, nhưng giải xong đề Toán thấy tự tin hơn nhiều.'
  );
  const [rebalancedInfo, setRebalancedInfo] = useState(null);
  const [previousTasksBackup, setPreviousTasksBackup] = useState(null);

  // Modal, Toast & Demo Mode
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [activeAlertModal, setActiveAlertModal] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, tone = 'emerald') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, tone });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Bộ đếm phiên học tập trung (Zero-Distraction Timer)
  useEffect(() => {
    if (!focusRunning) return;
    if (focusSeconds <= 0) {
      setFocusRunning(false);
      showToast(
        'Hoàn thành phiên tập trung 25 phút! Vòng tay đã rung nhẹ nhắc bạn vươn vai 3 phút.',
        'emerald'
      );
      return;
    }
    const interval = setInterval(() => {
      setFocusSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [focusRunning, focusSeconds]);

  // Tính toán cửa sổ đánh thức thông minh Anti-Sleep Inertia
  const smartWake = useMemo(
    () => calculateSmartWakeWindow(bedTime, maxWakeTime, tomorrowPriority),
    [bedTime, maxWakeTime, tomorrowPriority]
  );

  // Dữ liệu biểu đồ PPG & Đường cong năng lượng phản ứng theo trạng thái sinh học
  const ppgChartData = useMemo(() => {
    const base = sleepDeprived ? SLEEP_DEPRIVED_PPG_DATA : INITIAL_PPG_DATA;
    return base.map((pt, idx) =>
      idx === base.length - 1 ? { ...pt, hr: liveHr, hrv: liveHrv, spo2: liveSpo2 } : pt
    );
  }, [sleepDeprived, liveHr, liveHrv, liveSpo2]);

  const energyCurveData = useMemo(() => {
    const factor = sleepDeprived ? 0.72 : morningRecovery < 65 ? 0.85 : 1;
    return BASE_ENERGY_CURVE.map((pt) => ({
      ...pt,
      energy: Math.round(pt.energy * factor),
      focus: Math.round(pt.focus * factor),
    }));
  }, [sleepDeprived, morningRecovery]);

  const sleepHypnogramData = sleepDeprived
    ? SHORT_SLEEP_HYPNOGRAM
    : NORMAL_SLEEP_HYPNOGRAM;

  const isStressWarning = liveHrv <= 45 || liveHr >= 95;
  const isBurnoutSitting = sittingMinutes >= 60;

  // ============================================================================
  // HÀNH ĐỘNG CỐT LÕI: AUTO-REBALANCE LỊCH TRÌNH THEO CẢM XÚC & SINH HỌC
  // ============================================================================
  const handleAutoRebalance = (sourceLabel = 'cảm xúc của bạn') => {
    const todayFlexible = tasks.filter(
      (t) => t.day === 'Hôm nay' && !t.completed && !t.protected && t.priority === 'flexible'
    );

    if (todayFlexible.length === 0) {
      showToast(
        'Lịch hôm nay của bạn đã rất nhẹ nhàng và chỉ còn các đầu việc cốt lõi cùng thời gian nghỉ ngơi!',
        'blue'
      );
      return;
    }

    setPreviousTasksBackup(tasks);
    const targetDays = ['Thứ 5', 'Thứ 6', 'Thứ 4'];
    const movedList = [];

    const updated = tasks.map((task) => {
      if (
        task.day === 'Hôm nay' &&
        !task.completed &&
        !task.protected &&
        task.priority === 'flexible'
      ) {
        const destDay = targetDays[movedList.length % targetDays.length];
        movedList.push({ title: task.title, to: destDay });
        return {
          ...task,
          day: destDay,
          rescheduled: true,
        };
      }
      return task;
    });

    const hasRecovery = updated.some((t) => t.id === 't-recovery-auto');
    if (!hasRecovery) {
      updated.splice(2, 0, {
        id: 't-recovery-auto',
        title: 'Khoảng nghỉ phục hồi sinh học: Chợp mắt 20p & nghe nhạc sóng Alpha',
        subject: 'Phục hồi',
        category: 'recovery',
        day: 'Hôm nay',
        timeSlot: '13:00 – 13:30',
        duration: 30,
        priority: 'core',
        completed: false,
        protected: true,
        isAutoAdded: true,
      });
    }

    setTasks(updated);
    setRebalancedInfo({
      sourceLabel,
      movedList,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast(
      `Đã cân bằng lại lịch dựa trên ${sourceLabel}: Dời ${movedList.length} bài học nặng sang cuối tuần và thêm khoảng nghỉ phục hồi.`,
      'emerald'
    );
  };

  const handleUndoRebalance = () => {
    if (!previousTasksBackup) return;
    setTasks(previousTasksBackup);
    setRebalancedInfo(null);
    setPreviousTasksBackup(null);
    showToast('Đã khôi phục lại lịch trình ban đầu.', 'blue');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const meta = CATEGORY_META[newTaskCategory];
    const newItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      category: newTaskCategory,
      day: newTaskDay,
      timeSlot: meta.defaultSlot,
      duration: 60,
      priority: 'flexible',
      completed: false,
      protected: false,
    };
    setTasks((prev) => [newItem, ...prev]);
    setNewTaskTitle('');
    setShowAddTask(false);
    showToast(`Đã xếp "${newItem.title}" vào khung giờ vàng (${meta.defaultSlot}).`, 'emerald');
  };

  const toggleTaskDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ============================================================================
  // HÀNH ĐỘNG MỤC TIÊU ĐỊNH LƯỢNG & TỰ ĐỘNG ĐIỀU CHỈNH LỊCH TRÌNH
  // ============================================================================
  const applyGoalsToScheduler = (nextGoals, recovery = morningRecovery, deprived = sleepDeprived) => {
    let generatedCount = 0;
    setTasks((prev) => {
      const result = syncGoalsToTasks(prev, nextGoals, recovery, deprived);
      generatedCount = result.generatedCount;
      return result.updatedTasks;
    });
    return generatedCount;
  };

  const handleSaveGoal = (goalPayload, isEdit) => {
    const nextGoals = isEdit
      ? goals.map((g) => (g.id === goalPayload.id ? goalPayload : g))
      : [goalPayload, ...goals];
    setGoals(nextGoals);
    applyGoalsToScheduler(nextGoals);
    showToast(
      isEdit
        ? `Đã cập nhật mục tiêu "${goalPayload.title}" và điều chỉnh lại Lịch Thời điểm vàng.`
        : `Đã thêm mục tiêu "${goalPayload.title}" (${formatMetricValue(goalPayload.currentValue)} → ${formatMetricValue(goalPayload.targetValue)} ${goalPayload.unit}) và tự xếp lịch.`,
      'emerald'
    );
  };

  const handleUpdateGoalProgress = (goalId, nextValue) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const nextGoals = goals.map((g) =>
      g.id === goalId ? { ...g, currentValue: nextValue } : g
    );
    setGoals(nextGoals);
    applyGoalsToScheduler(nextGoals);
    if (targetGoal) {
      showToast(
        `Đã cập nhật "${targetGoal.title}" lên ${formatMetricValue(nextValue)}/${formatMetricValue(targetGoal.targetValue)} ${targetGoal.unit} · Lịch trình đã tự cân đối lại.`,
        'emerald'
      );
    }
  };

  const handleToggleGoalSync = (goalId) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const nextGoals = goals.map((g) =>
      g.id === goalId ? { ...g, autoSync: !g.autoSync } : g
    );
    setGoals(nextGoals);
    applyGoalsToScheduler(nextGoals);
    if (targetGoal) {
      showToast(
        !targetGoal.autoSync
          ? `Đã bật tự động xếp lịch cho "${targetGoal.title}".`
          : `Đã tạm tắt đồng bộ lịch cho "${targetGoal.title}".`,
        'blue'
      );
    }
  };

  const handleDeleteGoal = (goalId) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const nextGoals = goals.filter((g) => g.id !== goalId);
    setGoals(nextGoals);
    applyGoalsToScheduler(nextGoals);
    if (targetGoal) {
      showToast(`Đã xóa mục tiêu "${targetGoal.title}" và gỡ các phiên liên quan khỏi lịch.`, 'blue');
    }
  };

  const handleResyncSchedule = () => {
    applyGoalsToScheduler(goals);
    showToast(
      `Đã tái tối ưu toàn bộ lịch học & vận động từ ${goals.filter((g) => g.autoSync).length} mục tiêu theo Điểm hồi phục (${morningRecovery}/100).`,
      'emerald'
    );
  };

  const handleToggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    setFocusRunning(next);
    showToast(
      next
        ? 'Đã bật Chế độ Tập trung Học đường: Khóa thông báo mạng xã hội trên vòng tay.'
        : 'Đã tắt Chế độ Tập trung Học đường.',
      next ? 'blue' : 'emerald'
    );
  };

  // ============================================================================
  // 3 KỊCH BẢN MÔ PHỎNG TÍN HIỆU VÒNG TAY (DEMO MODE)
  // ============================================================================
  const triggerDemoScenario = (scenarioId) => {
    setDemoMenuOpen(false);
    setParentMode(false);

    if (scenarioId === 'hr_spike') {
      setLiveHr(108);
      setLiveHrv(44);
      setSelectedMood('anxious');
      setActiveAlertModal({
        type: 'hr',
        title: 'Phát hiện nhịp tim tăng đột ngột (108 bpm)',
        subtitle: 'Cảm biến PPG nhận diện dấu hiệu căng thẳng trước giờ kiểm tra',
        message:
          'Nhịp tim của bạn vừa tăng từ 71 lên 108 bpm dù đang ngồi yên. Đừng lo lắng nhé — chỉ cần 60 giây hít thở theo nhịp rung cổ tay sẽ kích hoạt dây thần kinh phế vị, giúp nhịp tim dịu xuống nhanh chóng.',
        ctaLabel: 'Bắt đầu hít thở 60 giây ngay',
        onCta: () => {
          setActiveAlertModal(null);
          setBreathingOpen(true);
        },
      });
    } else if (scenarioId === 'burnout_sitting') {
      setSittingMinutes(95);
      setActiveAlertModal({
        type: 'burnout',
        title: 'Cảnh báo Burnout Guard · Ngồi liên tục 95 phút',
        subtitle: 'Cảm biến gia tốc 3 trục phát hiện trạng thái tĩnh tại kéo dài',
        message:
          'Bạn đã tập trung học liên tục 95 phút vượt ngưỡng khuyến nghị (60 phút). Đứng dậy vươn vai, uống một ngụm nước và nhìn xa 20 giây sẽ giúp máu lưu thông lên não và tăng khả năng ghi nhớ thêm 22%.',
        ctaLabel: 'Mình đã đứng dậy nghỉ 3 phút',
        onCta: () => {
          setSittingMinutes(0);
          setActiveAlertModal(null);
          showToast('Tuyệt vời! Bộ đếm Burnout Guard đã được làm mới về 0 phút.', 'emerald');
        },
      });
    } else if (scenarioId === 'sleep_deprived') {
      setSleepDeprived(true);
      setLiveHrv(38);
      setLiveHr(79);
      setMorningRecovery(48);
      setSelectedMood('tired');
      setTasks((prev) => syncGoalsToTasks(prev, goals, 48, true).updatedTasks);
      setActiveAlertModal({
        type: 'sleep',
        title: 'Đêm qua thiếu ngủ · HRV giảm còn 38 ms',
        subtitle: 'Điểm hồi phục buổi sáng giảm còn 48/100 · Đường cong năng lượng đã tự cập nhật',
        message:
          'Đêm qua bạn chỉ ngủ 5 giờ 10 phút và thiếu pha ngủ sâu N3. Đường cong năng lượng hôm nay đã được điều chỉnh mềm hơn. ChronoMind đề xuất tạm dời bài tập nặng môn Vật Lý & Hóa học sang cuối tuần để tránh kiệt sức.',
        ctaLabel: 'Tự động giảm tải lịch Toán/Lý hôm nay',
        onCta: () => {
          setActiveAlertModal(null);
          setActiveTab('planner');
          handleAutoRebalance('chỉ số thiếu ngủ (HRV 38ms)');
        },
      });
    } else if (scenarioId === 'reset') {
      setSleepDeprived(false);
      setLiveHr(71);
      setLiveHrv(66);
      setLiveSpo2(99);
      setMorningRecovery(84);
      setSittingMinutes(42);
      setSelectedMood('stable');
      setGoals(INITIAL_GOALS);
      setTasks(syncGoalsToTasks(INITIAL_TASKS, INITIAL_GOALS, 84, false).updatedTasks);
      setRebalancedInfo(null);
      setPreviousTasksBackup(null);
      showToast('Đã khôi phục toàn bộ cảm biến về trạng thái sinh học cân bằng mặc định.', 'blue');
    }
  };

  const todayTasks = tasks.filter((t) => t.day === 'Hôm nay');
  const completedCount = tasks.filter((t) => t.completed).length;
  const overallProgress = Math.round((completedCount / Math.max(1, tasks.length)) * 100);
  const currentMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood) || MOOD_OPTIONS[1];
  const sharpTooltipStyle = getSharpTooltipStyle(darkMode);

  const navItems = [
    { id: 'biometrics', label: 'Trung tâm Sinh học', sub: 'PPG · Gia tốc · Hồi phục', icon: Activity },
    { id: 'sleep', label: 'Chu kỳ Giấc ngủ', sub: 'Chu kỳ 90p · Anti-Inertia', icon: Moon },
    { id: 'goals', label: 'Mục tiêu & Chỉ số', sub: 'Điểm số · Thói quen', icon: Target },
    { id: 'planner', label: 'Lịch Thời điểm vàng', sub: 'Nhịp sinh học cá nhân', icon: Calendar },
    { id: 'mood', label: 'Trợ lý Tinh thần AI', sub: 'Cảm xúc · Auto-Rebalance', icon: Brain },
    { id: 'band', label: 'Điều khiển Vòng tay', sub: '5 tính năng cốt lõi', icon: Watch },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="chronomind-root min-h-screen bg-[#F7F9FC] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-300 flex">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 justify-between sticky top-0 h-screen">
          <div>
            {/* Logo thương hiệu */}
            <div className="flex items-center gap-3 px-1 mb-7">
              <div className="w-10 h-10 rounded-none bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  ChronoMind
                </h1>
              </div>
            </div>

            {/* Điều hướng chính */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = !parentMode && activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setParentMode(false);
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-none text-left transition border-l-2 ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <div>
                      <div className="text-sm leading-tight">{item.label}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Thẻ hồ sơ học sinh phía dưới Sidebar */}
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                CA
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  Châu Anh
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Hồi phục hôm nay</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{morningRecovery}/100</span>
            </div>
          </div>
        </aside>

        {/* DRAWER MOBILE */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[82vw] bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-none bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      ChronoMind
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = !parentMode && activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setParentMode(false);
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-none text-left transition border-l-2 ${
                          active
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'border-transparent text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="text-xs text-slate-400 text-center">
                Châu Anh
              </div>
            </div>
          </div>
        )}

        {/* KHU VỰC NỘI DUNG CHÍNH */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* THANH TRẠNG THÁI VÒNG TAY Ở TRÊN CÙNG */}
          <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  aria-label="Mở điều hướng"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ChronoMind Band ·</span>
                  <span>Đã kết nối</span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  {battery}%
                </div>

                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-300">
                  <Heart className="w-3.5 h-3.5 animate-pulse" />
                  {liveHr} bpm
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={handleToggleFocusMode}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
                    focusMode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {focusMode ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">
                    {focusMode ? 'Đang tập trung' : 'Tập trung học đường'}
                  </span>
                </button>

                <button
                  onClick={() => setParentMode(!parentMode)}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
                    parentMode
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{parentMode ? 'Góc nhìn Phụ huynh' : 'Góc nhìn Học sinh'}</span>
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  aria-label="Chuyển chế độ Sáng/Tối"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </header>

          {/* NỘI DUNG CHÍNH THEO PHÂN HỆ */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
            {!parentMode && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Chào buổi sáng dịu nhẹ, Châu Anh 🌿
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {sleepDeprived
                      ? 'Hôm nay cơ thể cần sự nâng niu một chút — học chậm lại để giữ sức cho cả tuần thi nhé.'
                      : 'Nhịp sinh học của bạn đang ở vùng lý tưởng. Học đúng thời điểm vàng, nghỉ đúng lúc cần nghỉ.'}
                  </p>
                </div>
                <div className="text-xs font-medium text-slate-400">
                  Đồng bộ gần nhất: Vừa xong · Zero-Distraction UI
                </div>
              </div>
            )}

            {parentMode ? (
              <ParentCompanionView
                morningRecovery={morningRecovery}
                sleepDeprived={sleepDeprived}
                darkMode={darkMode}
                onExitParentMode={() => setParentMode(false)}
              />
            ) : activeTab === 'biometrics' ? (
              <BiometricsTab
                isStressWarning={isStressWarning}
                liveHrv={liveHrv}
                liveHr={liveHr}
                liveSpo2={liveSpo2}
                morningRecovery={morningRecovery}
                ppgChartData={ppgChartData}
                darkMode={darkMode}
                sharpTooltipStyle={sharpTooltipStyle}
                onOpenBreathing={() => setBreathingOpen(true)}
                onAutoRebalance={handleAutoRebalance}
              />
            ) : activeTab === 'sleep' ? (
              <SleepTab
                sleepDeprived={sleepDeprived}
                sleepHypnogramData={sleepHypnogramData}
                bedTime={bedTime}
                setBedTime={setBedTime}
                maxWakeTime={maxWakeTime}
                setMaxWakeTime={setMaxWakeTime}
                tomorrowPriority={tomorrowPriority}
                setTomorrowPriority={setTomorrowPriority}
                smartWake={smartWake}
                darkMode={darkMode}
                sharpTooltipStyle={sharpTooltipStyle}
                onSyncWakeAlarm={() =>
                  showToast(
                    `Đã đồng bộ báo thức rung êm ${smartWake.windowStart} – ${smartWake.windowEnd} xuống ChronoMind Band!`,
                    'emerald'
                  )
                }
              />
            ) : activeTab === 'goals' ? (
              <GoalsTab
                goals={goals}
                tasks={tasks}
                morningRecovery={morningRecovery}
                sleepDeprived={sleepDeprived}
                darkMode={darkMode}
                sharpTooltipStyle={sharpTooltipStyle}
                onSaveGoal={handleSaveGoal}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onToggleGoalSync={handleToggleGoalSync}
                onDeleteGoal={handleDeleteGoal}
                onResyncSchedule={handleResyncSchedule}
                onGoToPlanner={() => setActiveTab('planner')}
              />
            ) : activeTab === 'planner' ? (
              <PlannerTab
                rebalancedInfo={rebalancedInfo}
                onUndoRebalance={handleUndoRebalance}
                morningRecovery={morningRecovery}
                plannerView={plannerView}
                setPlannerView={setPlannerView}
                energyCurveData={energyCurveData}
                darkMode={darkMode}
                sharpTooltipStyle={sharpTooltipStyle}
                tasks={tasks}
                todayTasks={todayTasks}
                overallProgress={overallProgress}
                completedCount={completedCount}
                showAddTask={showAddTask}
                setShowAddTask={setShowAddTask}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskCategory={newTaskCategory}
                setNewTaskCategory={setNewTaskCategory}
                setNewTaskSubject={setNewTaskSubject}
                newTaskDay={newTaskDay}
                setNewTaskDay={setNewTaskDay}
                onAddTask={handleAddTask}
                onToggleTaskDone={toggleTaskDone}
                onDeleteTask={deleteTask}
                goals={goals}
                onGoToGoals={() => setActiveTab('goals')}
              />
            ) : activeTab === 'mood' ? (
              <MoodTab
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                currentMoodObj={currentMoodObj}
                onAutoRebalance={handleAutoRebalance}
                rebalancedInfo={rebalancedInfo}
                onGoToPlanner={() => setActiveTab('planner')}
                privateJournal={privateJournal}
                setPrivateJournal={setPrivateJournal}
                liveHrv={liveHrv}
                onOpenBreathing={() => setBreathingOpen(true)}
              />
            ) : (
              <BandFeaturesTab
                focusMode={focusMode}
                onToggleFocusMode={handleToggleFocusMode}
                focusSeconds={focusSeconds}
                focusRunning={focusRunning}
                setFocusRunning={setFocusRunning}
                setFocusMode={setFocusMode}
                setFocusSeconds={setFocusSeconds}
                battery={battery}
                liveHr={liveHr}
                liveHrv={liveHrv}
                onOpenBreathing={() => setBreathingOpen(true)}
                isBurnoutSitting={isBurnoutSitting}
                sittingMinutes={sittingMinutes}
                sleepDeprived={sleepDeprived}
                onResetSitting={() => {
                  setSittingMinutes(0);
                  showToast(
                    'Đã ghi nhận 3 phút vươn vai thư giãn! Bộ đếm ngồi liên tục đặt về 0 phút.',
                    'emerald'
                  );
                }}
                onOpenParentMode={() => setParentMode(true)}
              />
            )}
          </main>
        </div>

        {/* ==================================================================== */}
        {/* NÚT NỔI MÔ PHỎNG TÍN HIỆU VÒNG TAY (DEMO MODE) GÓC DƯỚI PHẢI */}
        {/* ==================================================================== */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
          {demoMenuOpen && (
            <div className="mb-3 w-80 max-w-[90vw] rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                  Kịch bản Mô phỏng Tín hiệu Vòng tay
                </div>
                <button
                  onClick={() => setDemoMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => triggerDemoScenario('hr_spike')}
                className="w-full p-3 rounded-none bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-left transition"
              >
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  1. Nhịp tim tăng đột ngột (108 bpm)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Lo âu trước kiểm tra → Tự bật gợi ý hít thở 60 giây
                </div>
              </button>

              <button
                onClick={() => triggerDemoScenario('burnout_sitting')}
                className="w-full p-3 rounded-none bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-950/70 border border-amber-200 dark:border-amber-900/60 text-left transition"
              >
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  2. Ngồi học liên tục 95 phút
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Kích hoạt cảnh báo quá tải Burnout Guard
                </div>
              </button>

              <button
                onClick={() => triggerDemoScenario('sleep_deprived')}
                className="w-full p-3 rounded-none bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-950/70 border border-purple-200 dark:border-purple-900/60 text-left transition"
              >
                <div className="text-xs font-bold text-purple-800 dark:text-purple-300">
                  3. Đêm qua thiếu ngủ (HRV còn 38ms)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Điều chỉnh đường cong năng lượng & giảm tải Toán/Lý
                </div>
              </button>

              <button
                onClick={() => triggerDemoScenario('reset')}
                className="w-full py-2 rounded-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Khôi phục dữ liệu mặc định
              </button>
            </div>
          )}

          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="px-4 py-3 rounded-none bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 transition border border-slate-700 dark:border-blue-400/40"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Mô phỏng tín hiệu vòng tay</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* POP-UP CẢNH BÁO TƯƠNG TÁC TỪ KỊCH BẢN MÔ PHỎNG */}
        {/* ==================================================================== */}
        {activeAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`p-3 rounded-none ${
                    activeAlertModal.type === 'hr'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300'
                      : activeAlertModal.type === 'burnout'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300'
                  }`}
                >
                  {activeAlertModal.type === 'hr' ? (
                    <Heart className="w-6 h-6 animate-pulse" />
                  ) : activeAlertModal.type === 'burnout' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                </div>
                <button
                  onClick={() => setActiveAlertModal(null)}
                  className="p-1.5 rounded-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
                {activeAlertModal.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {activeAlertModal.subtitle}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {activeAlertModal.message}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={activeAlertModal.onCta}
                  className="flex-1 py-3 px-4 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm"
                >
                  {activeAlertModal.ctaLabel}
                </button>
                <button
                  onClick={() => setActiveAlertModal(null)}
                  className="py-3 px-4 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL HÍT THỞ 60 GIÂY */}
        <BreathingModal
          isOpen={breathingOpen}
          onClose={() => setBreathingOpen(false)}
          currentHr={liveHr}
          onCompleteReset={() => {
            setLiveHr(72);
            setLiveHrv((prev) => Math.max(prev, 64));
            showToast('Hoàn thành bài tập hít thở! Nhịp tim đã dịu xuống 72 bpm.', 'emerald');
          }}
        />

        {/* THÔNG BÁO TOAST MỀM */}
        {toast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 z-50 max-w-md w-[92vw] sm:w-auto">
            <div
              className={`px-4 py-3 rounded-none shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
                toast.tone === 'blue'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
