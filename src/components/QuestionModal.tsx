import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Obstacle } from '../utils/mazeGenerator';
import { soundEngine } from '../utils/audio';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, ShieldAlert, Mountain } from 'lucide-react';

interface QuestionModalProps {
  obstacle: Obstacle;
  onSuccess: (obstacleId: number) => void;
  onClose: () => void;
}

const ENCOURAGING_MESSAGES = [
  '🎉 Xuất sắc! Em nắm kiến thức rất vững!',
  '🌟 Tuyệt vời! Chướng ngại vật đã được phá vỡ!',
  '👏 Rất thông minh! Tiếp tục tiến lên nào!',
  '🚀 Quá đỉnh! Con đường đến lối ra đang mở rộng!',
  '💡 Chuẩn xác 100%! Tinh thần thám hiểm đáng khen ngợi!',
];

export const QuestionModal: React.FC<QuestionModalProps> = ({
  obstacle,
  onSuccess,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [encouragement, setEncouragement] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const { question } = obstacle;
  const isRock = obstacle.type === 'rock';

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
    });
  };

  const handleSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    if (status === 'correct') return;
    setSelectedOption(key);
    setStatus('idle');
  };

  const handleConfirm = () => {
    if (!selectedOption || status === 'correct') return;

    if (selectedOption === question.correct) {
      setStatus('correct');
      const randomMsg =
        ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      setEncouragement(randomMsg);
      soundEngine.playCorrectSound();
      soundEngine.playObstacleClearedSound();
      triggerConfetti();

      // Automatically complete after a brief celebration
      setTimeout(() => {
        onSuccess(obstacle.id);
      }, 1300);
    } else {
      setStatus('wrong');
      soundEngine.playWrongSound();
      setShakeKey((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        key={shakeKey}
        className={`relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          status === 'correct'
            ? 'border-emerald-500 ring-4 ring-emerald-500/20'
            : status === 'wrong'
            ? 'border-rose-400 ring-4 ring-rose-500/20 animate-shake'
            : 'border-slate-200'
        }`}
      >
        {/* Header Banner */}
        <div
          className={`px-6 py-4 flex items-center justify-between text-white ${
            isRock
              ? 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900'
              : 'bg-gradient-to-r from-rose-800 via-rose-700 to-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
              {isRock ? (
                <Mountain className="w-6 h-6 text-amber-200" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-200" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-amber-200/90">
                {isRock ? 'Khối Đá Chắn Đường' : 'Bẫy Gai Nguy Hiểm'} · Câu {obstacle.questionId} / 24
              </div>
              <h3 className="text-lg font-bold">
                {isRock ? 'Phá Hủy Khối Đá Khổng Lồ' : 'Vô Hiệu Hóa Bẫy Gai'}
              </h3>
            </div>
          </div>

          <div className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-medium">
            {question.topic}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-2">
            Trả lời đúng câu hỏi dưới đây để mở lối đi cho Robot:
          </p>

          <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-5 leading-snug">
            {question.question}
          </h4>

          {/* Options List */}
          <div className="space-y-2.5 mb-6">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectAnswer = opt.key === question.correct;
              const showCorrectStyle = status === 'correct' && isCorrectAnswer;
              const showWrongStyle = status === 'wrong' && isSelected;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  disabled={status === 'correct'}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    showCorrectStyle
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium shadow-sm'
                      : showWrongStyle
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                      showCorrectStyle
                        ? 'bg-emerald-500 text-white'
                        : showWrongStyle
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="flex-1 text-sm pt-0.5 leading-relaxed">
                    {opt.text}
                  </span>
                  {showCorrectStyle && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  {showWrongStyle && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Status Alert Banner */}
          {status === 'correct' && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 animate-fadeIn">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
              <span className="text-sm font-semibold">{encouragement}</span>
            </div>
          )}

          {status === 'wrong' && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2.5 animate-fadeIn">
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="text-sm">
                Chưa chính xác rồi em ơi! Hãy suy nghĩ thật kỹ và chọn lại đáp án nhé.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'correct'}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Lùi lại tìm đường khác
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedOption || status === 'correct'}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                status === 'correct'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : selectedOption
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{status === 'correct' ? 'Đang mở lối...' : 'Xác nhận đáp án'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
