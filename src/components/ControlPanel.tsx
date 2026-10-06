import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';

interface ControlPanelProps {
  timeSeconds: number;
  stepsCount: number;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onResetPosition: () => void;
  onNewMaze: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  obstaclesCleared: number;
  totalObstacles: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  timeSeconds,
  stepsCount,
  onMove,
  onResetPosition,
  onNewMaze,
  isMusicPlaying,
  onToggleMusic,
  obstaclesCleared,
  totalObstacles,
}) => {
  return (
    <div className="flex flex-col gap-3.5 w-full max-w-[380px] mx-auto select-none">
      {/* 1. Stats Grid - Thời gian & Số bước */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 text-center shadow-2xs">
          <div className="text-xs text-sky-800 font-medium">Thời gian</div>
          <div className="text-2xl font-extrabold text-sky-950 font-mono my-0.5">
            {timeSeconds}
          </div>
          <div className="text-[11px] text-sky-600 font-medium">giây</div>
        </div>

        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 text-center shadow-2xs">
          <div className="text-xs text-sky-800 font-medium">Số bước</div>
          <div className="text-2xl font-extrabold text-sky-950 font-mono my-0.5">
            {stepsCount}
          </div>
          <div className="text-[11px] text-sky-600 font-medium">bước</div>
        </div>
      </div>

      {/* 2. Obstacles Cleared Progress bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-700">
          <span>Chướng ngại vật đã vượt:</span>
          <span className="text-emerald-600 font-bold font-mono text-sm">
            {obstaclesCleared} / {totalObstacles}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(obstaclesCleared / totalObstacles) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. Robot D-Pad Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col items-center">
        <div className="w-full text-left font-bold text-xs text-slate-800 mb-2.5">
          Điều khiển robot
        </div>

        <div className="flex flex-col items-center gap-2 my-1">
          {/* UP */}
          <button
            type="button"
            onClick={() => onMove('up')}
            className="w-14 h-12 bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 active:translate-y-0.5 text-sky-800 rounded-xl shadow-xs border border-sky-300/80 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Đi lên"
          >
            <ArrowUp className="w-6 h-6 text-sky-700" />
          </button>

          {/* LEFT, DOWN, RIGHT */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMove('left')}
              className="w-14 h-12 bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 active:translate-y-0.5 text-sky-800 rounded-xl shadow-xs border border-sky-300/80 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Sang trái"
            >
              <ArrowLeft className="w-6 h-6 text-sky-700" />
            </button>
            <button
              type="button"
              onClick={() => onMove('down')}
              className="w-14 h-12 bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 active:translate-y-0.5 text-sky-800 rounded-xl shadow-xs border border-sky-300/80 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Đi xuống"
            >
              <ArrowDown className="w-6 h-6 text-sky-700" />
            </button>
            <button
              type="button"
              onClick={() => onMove('right')}
              className="w-14 h-12 bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 active:translate-y-0.5 text-sky-800 rounded-xl shadow-xs border border-sky-300/80 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Sang phải"
            >
              <ArrowRight className="w-6 h-6 text-sky-700" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Chơi lại & Mê cung mới */}
        <div className="w-full grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onResetPosition}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại</span>
          </button>
          <button
            type="button"
            onClick={onNewMaze}
            className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mê cung mới</span>
          </button>
        </div>
      </div>

      {/* Dramatic Background Music Toggle */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {isMusicPlaying ? (
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-xs font-semibold">Nhạc nền kịch tính</span>
        </div>
        <button
          type="button"
          onClick={onToggleMusic}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            isMusicPlaying
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {isMusicPlaying ? 'Đang phát' : 'Bật nhạc'}
        </button>
      </div>

      {/* 4. Bí quyết thám hiểm mê cung */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Bí quyết thám hiểm</span>
        </div>
        <ul className="space-y-1 text-[11.5px] leading-relaxed text-amber-900/90 pl-1">
          <li className="flex items-start gap-1">
            <span className="text-amber-600 font-bold">•</span>
            <span>Quan sát kỹ ngã rẽ và các lối thông trước khi bước đi.</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-amber-600 font-bold">•</span>
            <span>Phá khối đá và bẫy gai để mở ra con đường ngắn nhất tới Lối ra.</span>
          </li>
          <li className="flex items-start gap-1">
            <span className="text-amber-600 font-bold">•</span>
            <span>Đọc kỹ câu hỏi Tin học để vượt qua cạm bẫy ngay lần đầu tiên!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
