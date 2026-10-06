import React from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Sparkles, Clock, Footprints, ShieldCheck, Award } from 'lucide-react';

interface VictoryModalProps {
  timeSeconds: number;
  stepsCount: number;
  obstaclesCleared: number;
  totalObstacles: number;
  onRestart: () => void;
  onNewMaze: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  timeSeconds,
  stepsCount,
  obstaclesCleared,
  totalObstacles,
  onRestart,
  onNewMaze,
}) => {
  React.useEffect(() => {
    // Grand celebration confetti burst
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m} phút ` : ''}${s} giây`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5">
          <Trophy className="w-10 h-10 text-white animate-bounce" />
          <Sparkles className="w-6 h-6 text-yellow-100 absolute -top-2 -right-2" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Chiến Thắng Mê Cung!
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Chúc mừng em đã dũng cảm đưa Robot vượt qua tất cả cạm bẫy và cập bến thành công!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 text-blue-500 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Thời gian</div>
            <div className="text-base font-bold text-slate-800">{formatTime(timeSeconds)}</div>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200">
            <Footprints className="w-5 h-5 text-indigo-500 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Số bước</div>
            <div className="text-base font-bold text-slate-800">{stepsCount} bước</div>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Vượt chướng ngại</div>
            <div className="text-base font-bold text-emerald-600">
              {obstaclesCleared}/{totalObstacles}
            </div>
          </div>
        </div>

        {/* Praise badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold mb-6">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Danh hiệu: Bậc Thầy Quản Lý Tệp & Thư Mục!</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại mê cung này</span>
          </button>
          <button
            type="button"
            onClick={onNewMaze}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mê cung mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
