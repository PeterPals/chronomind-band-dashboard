// ============================================================================
// GOAL-DRIVEN SCHEDULER: PHÂN BỔ MỤC TIÊU SỐ VÀO LỊCH THỜI ĐIỂM VÀNG
// ============================================================================

const PLANNER_DAYS = ['Hôm nay', 'Thứ 4', 'Thứ 5', 'Thứ 6'];

const SLOT_POOLS = {
  logic: ['07:45 – 08:45', '09:00 – 10:15', '10:30 – 11:30'],
  creative: ['14:30 – 15:30', '15:45 – 16:45', '20:15 – 21:00'],
  active: ['17:15 – 17:45', '18:00 – 18:45'],
  recovery: ['12:45 – 13:15', '21:15 – 21:45'],
};

const CATEGORY_COLORS = {
  logic: '#2563EB',
  creative: '#8B5CF6',
  active: '#F59E0B',
  recovery: '#10B981',
};

/**
 * Format a numeric value cleanly (integers without decimals, decimals up to 2 places).
 */
export function formatMetricValue(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0';
  if (Number.isInteger(num)) return num.toLocaleString('vi-VN');
  return Number(num.toFixed(2)).toString();
}

/**
 * Calculate goal progress percentage, remaining gap, and adaptive status.
 */
export function getGoalMetrics(goal) {
  const current = Number(goal.currentValue) || 0;
  const target = Math.max(0.01, Number(goal.targetValue) || 1);
  const baseline = Number(goal.baselineValue) || 0;

  let progressPct;
  if (baseline > 0 && baseline < target) {
    const span = target - baseline;
    progressPct = Math.round(((current - baseline) / span) * 100);
  } else {
    progressPct = Math.round((current / target) * 100);
  }
  progressPct = Math.max(0, Math.min(100, progressPct));

  const remaining = Math.max(0, Number((target - current).toFixed(2)));
  const gapRatio = Math.min(1, remaining / target);
  const isAchieved = current >= target;

  return {
    current,
    target,
    baseline,
    progressPct,
    remaining,
    gapRatio,
    isAchieved,
    color: CATEGORY_COLORS[goal.category] || '#2563EB',
  };
}

/**
 * Compute adaptive session plan per goal based on numeric gap, priority, and biometrics.
 */
export function computeGoalPlans(goals, morningRecovery = 84, sleepDeprived = false) {
  const isLowEnergy = sleepDeprived || morningRecovery < 65;

  return goals.map((goal, goalIdx) => {
    const metrics = getGoalMetrics(goal);
    const baseSessionsPerWeek = Math.max(1, Math.min(7, Number(goal.sessionsPerWeek) || 3));
    const baseDuration = Math.max(15, Math.min(180, Number(goal.sessionMinutes) || 45));

    // Gap-driven intensity adjustment: larger gap + high priority gets priority on today + extra slots
    let plannedSessionsIn4DayWindow =
      goal.cadence === 'daily'
        ? 4
        : Math.max(1, Math.min(4, Math.ceil(baseSessionsPerWeek * 0.65)));

    let adjustedDuration = baseDuration;
    let adaptiveNote = 'Phân bổ đúng khung giờ vàng sinh học';

    if (!goal.autoSync) {
      return {
        goal,
        metrics,
        plannedDays: [],
        adjustedDuration: baseDuration,
        weeklyMinutes: 0,
        adaptiveNote: 'Đã tạm tắt đồng bộ tự động vào lịch',
      };
    }

    if (metrics.isAchieved && goal.cadence !== 'daily') {
      plannedSessionsIn4DayWindow = 1;
      adjustedDuration = Math.max(20, Math.round(baseDuration * 0.5));
      adaptiveNote = 'Đã đạt mục tiêu số — chuyển sang chế độ duy trì nhẹ';
    } else if (isLowEnergy && goal.category === 'logic') {
      adjustedDuration = Math.max(25, Math.round(baseDuration * 0.75));
      if (goal.priority !== 'high') {
        plannedSessionsIn4DayWindow = Math.max(1, plannedSessionsIn4DayWindow - 1);
      }
      adaptiveNote = `Giảm nhịp 25% (${adjustedDuration}p/buổi) do hồi phục ${morningRecovery}/100`;
    } else if (metrics.gapRatio >= 0.15 && goal.priority === 'high' && goal.cadence !== 'daily') {
      plannedSessionsIn4DayWindow = Math.min(4, plannedSessionsIn4DayWindow + 1);
      adaptiveNote = `Tăng mật độ do còn thiếu ${formatMetricValue(metrics.remaining)} ${goal.unit}`;
    } else if (goal.cadence === 'daily') {
      adaptiveNote = `Lặp đều hằng ngày (${adjustedDuration}p/ngày)`;
    }

    // Choose days across the 4 visible planner columns: Hôm nay, Thứ 4, Thứ 5, Thứ 6
    const plannedDays = [];
    if (goal.cadence === 'daily') {
      plannedDays.push(...PLANNER_DAYS);
    } else {
      const startOffset = goal.priority === 'high' ? 0 : goalIdx % 2;
      for (let i = 0; i < plannedSessionsIn4DayWindow; i += 1) {
        const day = PLANNER_DAYS[(startOffset + i) % PLANNER_DAYS.length];
        if (!plannedDays.includes(day)) plannedDays.push(day);
      }
      if (goal.priority === 'high' && !plannedDays.includes('Hôm nay')) {
        plannedDays.unshift('Hôm nay');
      }
    }

    const weeklySessions = goal.cadence === 'daily' ? 7 : baseSessionsPerWeek;
    const weeklyMinutes = weeklySessions * adjustedDuration;

    return {
      goal,
      metrics,
      plannedDays,
      adjustedDuration,
      weeklyMinutes,
      adaptiveNote,
    };
  });
}

/**
 * Generate concrete scheduler tasks from goals and merge with manual/existing tasks.
 * Preserves all non-goal tasks and preserves completion state of matching goal tasks.
 */
export function syncGoalsToTasks(existingTasks, goals, morningRecovery = 84, sleepDeprived = false) {
  const manualTasks = existingTasks.filter((t) => !t.isGoalGenerated);
  const completedMap = new Map(
    existingTasks
      .filter((t) => t.isGoalGenerated && t.completed)
      .map((t) => [t.id, true])
  );

  const plans = computeGoalPlans(goals, morningRecovery, sleepDeprived);
  const daySlotUsage = {};
  const generatedTasks = [];

  plans.forEach((plan) => {
    const { goal, metrics, plannedDays, adjustedDuration } = plan;
    if (!goal.autoSync || plannedDays.length === 0) return;

    const pool = SLOT_POOLS[goal.category] || SLOT_POOLS.logic;

    plannedDays.forEach((day) => {
      const key = `${day}-${goal.category}`;
      const usedIdx = daySlotUsage[key] || 0;
      daySlotUsage[key] = usedIdx + 1;
      const timeSlot = pool[usedIdx % pool.length];

      const taskId = `goal-task-${goal.id}-${day}`;
      const gapText =
        goal.cadence === 'daily'
          ? `${formatMetricValue(metrics.current)}/${formatMetricValue(metrics.target)} ${goal.unit}`
          : metrics.isAchieved
          ? `Duy trì mốc ${formatMetricValue(metrics.target)} ${goal.unit}`
          : `Còn thiếu ${formatMetricValue(metrics.remaining)} ${goal.unit}`;

      generatedTasks.push({
        id: taskId,
        goalId: goal.id,
        goalTitle: goal.title,
        isGoalGenerated: true,
        title: `${goal.title} (${gapText})`,
        subject: goal.subject,
        category: goal.category,
        day,
        timeSlot,
        duration: adjustedDuration,
        priority: goal.priority === 'high' ? 'core' : 'flexible',
        completed: completedMap.get(taskId) || false,
        protected: goal.cadence === 'daily' && goal.category === 'active',
        rescheduled: sleepDeprived && goal.category === 'logic',
      });
    });
  });

  // Sort day tasks roughly by timeSlot order while keeping manual tasks intact
  const merged = [...manualTasks, ...generatedTasks].sort((a, b) => {
    const dayDiff = PLANNER_DAYS.indexOf(a.day) - PLANNER_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return String(a.timeSlot).localeCompare(String(b.timeSlot));
  });

  const totalGoalMinutesToday = generatedTasks
    .filter((t) => t.day === 'Hôm nay')
    .reduce((sum, t) => sum + t.duration, 0);

  return {
    updatedTasks: merged,
    plans,
    generatedCount: generatedTasks.length,
    todayGoalMinutes: totalGoalMinutesToday,
  };
}
