// ============================================================================
// HÀM TIỆN ÍCH TÍNH CHU KỲ GIẤC NGỦ CHỐNG QUÁN TÍNH (ANTI-SLEEP INERTIA)
// ============================================================================

export function calculateSmartWakeWindow(bedTimeStr, maxWakeStr, tomorrowPriority) {
  const [bH, bM] = bedTimeStr.split(':').map(Number);
  const [wH, wM] = maxWakeStr.split(':').map(Number);

  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;

  const sleepOnset = 15; // 15 phút ru ngủ trung bình (N1)
  const sleepStart = bedMinutes + sleepOnset;
  const maxAvailableSleep = wakeMinutes - sleepStart;

  // Tìm số chu kỳ 90 phút nguyên vẹn phù hợp nhất trước giờ hẹn tối đa
  const fullCycles = Math.max(3, Math.min(6, Math.floor(maxAvailableSleep / 90)));
  const idealEndOfCycle = sleepStart + fullCycles * 90;

  // Cửa sổ đánh thức thông minh 20-30 phút trước giờ hẹn tối đa (rơi vào pha ngủ nông N2)
  const windowLength = tomorrowPriority === 'high' ? 20 : 25;
  let windowEnd = Math.min(wakeMinutes, idealEndOfCycle + 10);
  if (wakeMinutes - idealEndOfCycle > 45) {
    windowEnd = wakeMinutes;
  }
  const windowStart = windowEnd - windowLength;

  const formatMinutes = (mins) => {
    const norm = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
    const hh = String(Math.floor(norm / 60)).padStart(2, '0');
    const mm = String(norm % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const totalSleepHours = ((windowEnd - sleepStart) / 60).toFixed(1);

  let reason = '';
  if (tomorrowPriority === 'high') {
    reason = `Ngày mai có lịch học/kiểm tra quan trọng. Vòng tay sẽ quét nhịp tim và cử động cổ tay từ ${formatMinutes(windowStart)} đến ${formatMinutes(windowEnd)} để rung êm ngay khi bạn vừa kết thúc chu kỳ REM thứ ${fullCycles} và bước vào pha ngủ nông (N2), giúp vỏ não tỉnh táo tức thì mà không bị choáng váng.`;
  } else if (tomorrowPriority === 'light') {
    reason = `Ngày mai nhịp độ nhẹ nhàng. Khung cửa sổ ${formatMinutes(windowStart)} – ${formatMinutes(windowEnd)} cho phép bạn hoàn tất trọn vẹn ${fullCycles} chu kỳ 90 phút (${totalSleepHours} giờ ngủ thực), ưu tiên tối đa phục hồi thể chất N3.`;
  } else {
    reason = `Với giờ đi ngủ ${bedTimeStr} (+15 phút ru ngủ), hoàn tất ${fullCycles} chu kỳ 90 phút rơi đúng vào pha ngủ nông (N2) trong khoảng ${formatMinutes(windowStart)} – ${formatMinutes(windowEnd)}. Đánh thức tại điểm này giúp giảm đến 78% cảm giác uể oải sáng sớm (Quán tính giấc ngủ).`;
  }

  return {
    windowStart: formatMinutes(windowStart),
    windowEnd: formatMinutes(windowEnd),
    fullCycles,
    totalSleepHours,
    reason,
  };
}

export function formatClock(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function getSharpTooltipStyle(darkMode) {
  return {
    borderRadius: '0px',
    border: darkMode ? '1px solid #334155' : '1px solid #CBD5E1',
    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
    boxShadow: '0 8px 20px -4px rgba(0,0,0,0.12)',
    fontSize: '12px',
  };
}
