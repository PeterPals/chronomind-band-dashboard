import { useState, useEffect } from 'react';
import { X, Wind, Heart, Play, Pause } from 'lucide-react';

// ============================================================================
// MODAL BÀI TẬP HÍT THỞ 60 GIÂY (4s HÍT - 4s GIỮ - 4s THỞ)
// ============================================================================

export default function BreathingModal({ isOpen, onClose, currentHr, onCompleteReset }) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(true);
  const [simHr, setSimHr] = useState(currentHr);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(60);
      setIsRunning(true);
      setSimHr(currentHr);
    }
  }, [isOpen, currentHr]);

  useEffect(() => {
    if (!isOpen || !isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      onCompleteReset();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
      setSimHr((prev) => (prev > 72 ? Math.max(72, prev - 0.65) : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isRunning, secondsLeft, onCompleteReset]);

  if (!isOpen) return null;

  const elapsed = 60 - secondsLeft;
  const cyclePos = elapsed % 12;
  let phase = 'Hít vào chậm rãi';
  let phaseSub = 'Vòng tay đang rung tăng dần nhẹ nhàng...';
  let scaleClass = 'scale-125';
  let ringColor = 'from-emerald-400/40 to-teal-500/40 border-emerald-400';

  if (cyclePos < 4) {
    phase = 'Hít vào (4 giây)';
    phaseSub = 'Rung nhẹ dẫn nhịp · Nở lồng ngực từ từ';
    scaleClass = 'scale-125';
    ringColor = 'from-emerald-400/35 to-cyan-400/35 border-emerald-400';
  } else if (cyclePos < 8) {
    phase = 'Giữ hơi (4 giây)';
    phaseSub = 'Tạm dừng êm ái · Thả lỏng hai bờ vai';
    scaleClass = 'scale-125';
    ringColor = 'from-blue-400/35 to-indigo-400/35 border-blue-400';
  } else {
    phase = 'Thở ra hết (4 giây)';
    phaseSub = 'Rung giảm dần · Buông bỏ căng thẳng';
    scaleClass = 'scale-90';
    ringColor = 'from-purple-400/35 to-emerald-400/35 border-purple-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-6 sm:p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Wind className="w-3.5 h-3.5" />
          Điều hòa nhịp thở 60 giây · Đồng bộ rung cổ tay
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {secondsLeft > 0 ? phase : 'Tuyệt vời! Bạn đã ổn định trở lại'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 min-h-[20px]">
          {secondsLeft > 0
            ? phaseSub
            : 'Nhịp tim đã hạ về vùng an toàn. Bạn sẵn sàng bước vào giờ học thật bình tĩnh.'}
        </p>

        {/* Vòng tròn chuyển động hít thở */}
        <div className="relative flex items-center justify-center h-56 my-4">
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-br ${ringColor} border-2 flex items-center justify-center transition-transform duration-[3800ms] ease-in-out ${
              secondsLeft > 0 && isRunning ? scaleClass : 'scale-100'
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-white/85 dark:bg-slate-900/85 shadow-inner flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {secondsLeft}s
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                còn lại
              </span>
            </div>
          </div>
        </div>

        {/* Nhịp tim trực tiếp mô phỏng hạ xuống */}
        <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-none bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 mb-5">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Nhịp tim đo qua PPG:
            </span>
            <strong className="text-base font-bold text-slate-900 dark:text-white">
              {Math.round(simHr)} bpm
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {secondsLeft > 0 ? (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-5 py-2.5 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition inline-flex items-center gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
            </button>
          ) : null}
          <button
            onClick={() => {
              onCompleteReset();
              onClose();
            }}
            className="px-6 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm"
          >
            {secondsLeft > 0 ? 'Hoàn tất sớm' : 'Quay lại Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
