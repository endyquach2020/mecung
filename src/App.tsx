import { useState, useEffect, useCallback, useRef } from 'react';
import { generateRandomMaze, MazeData, CellCoord, Obstacle } from './utils/mazeGenerator';
import { soundEngine } from './utils/audio';
import { MazeBoard } from './components/MazeBoard';
import { ControlPanel } from './components/ControlPanel';
import { QuestionModal } from './components/QuestionModal';
import { VictoryModal } from './components/VictoryModal';
import { BookOpen, Volume2, VolumeX } from 'lucide-react';
import { QUESTIONS } from './data/questions';

export default function App() {
  const [maze, setMaze] = useState<MazeData>(() => generateRandomMaze());
  const [robotPos, setRobotPos] = useState<CellCoord>(() => maze.start);
  const [activeObstacle, setActiveObstacle] = useState<Obstacle | null>(null);
  const [clearedObstacles, setClearedObstacles] = useState<Set<number>>(new Set());

  // Stats
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [stepsCount, setStepsCount] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Sound & Music
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Question bank modal for reference
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  // Timer reference
  const timerRef = useRef<number | null>(null);

  // Start timer
  useEffect(() => {
    if (!isWon) {
      timerRef.current = window.setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWon]);

  // Handle Movement
  const moveRobot = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (isWon || activeObstacle) return;

      let dr = 0;
      let dc = 0;
      if (direction === 'up') dr = -1;
      if (direction === 'down') dr = 1;
      if (direction === 'left') dc = -1;
      if (direction === 'right') dc = 1;

      const nextR = robotPos.r + dr;
      const nextC = robotPos.c + dc;

      // Check boundaries
      if (nextR < 0 || nextR >= maze.rows || nextC < 0 || nextC >= maze.cols) return;

      // Check wall
      if (maze.grid[nextR][nextC] === 1) {
        return; // Wall blocks movement
      }

      // Check obstacle
      const obstacleKey = `${nextR},${nextC}`;
      const obstacle = maze.obstacles.get(obstacleKey);

      if (obstacle && !obstacle.cleared && !clearedObstacles.has(obstacle.id)) {
        // Bumped into an uncleared obstacle!
        soundEngine.playObstacleBumpSound(obstacle.type);
        setActiveObstacle(obstacle);
        return;
      }

      // Open path or cleared obstacle: move robot!
      soundEngine.playStepSound();
      const newPos = { r: nextR, c: nextC };
      setRobotPos(newPos);
      setStepsCount((prev) => prev + 1);

      // Check if robot reached Exit
      if (newPos.r === maze.exit.r && newPos.c === maze.exit.c) {
        setIsWon(true);
        soundEngine.playVictoryFanfare();
      }
    },
    [robotPos, maze, isWon, activeObstacle, clearedObstacles]
  );

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scrolling the page when using arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (activeObstacle || isWon) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveRobot('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          moveRobot('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveRobot('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRobot('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveRobot, activeObstacle, isWon]);

  // Answer obstacle question correctly
  const handleAnswerSuccess = (obstacleId: number) => {
    if (!activeObstacle) return;

    // Mark obstacle as cleared
    activeObstacle.cleared = true;
    setClearedObstacles((prev) => new Set(prev).add(obstacleId));

    // Move robot into that tile
    const newPos = { r: activeObstacle.r, c: activeObstacle.c };
    setRobotPos(newPos);
    setStepsCount((prev) => prev + 1);
    setActiveObstacle(null);

    // Check if that tile was the exit
    if (newPos.r === maze.exit.r && newPos.c === maze.exit.c) {
      setIsWon(true);
      soundEngine.playVictoryFanfare();
    }
  };

  // Replay current maze (resets robot and time)
  const handleResetPosition = () => {
    setRobotPos(maze.start);
    setStepsCount(0);
    setTimeSeconds(0);
    setIsWon(false);
    setActiveObstacle(null);
  };

  // Generate completely new maze
  const handleNewMaze = () => {
    const newMaze = generateRandomMaze();
    setMaze(newMaze);
    setRobotPos(newMaze.start);
    setClearedObstacles(new Set());
    setStepsCount(0);
    setTimeSeconds(0);
    setIsWon(false);
    setActiveObstacle(null);
  };

  // Toggle Music
  const handleToggleMusic = () => {
    const playing = soundEngine.toggleMusic();
    setIsMusicPlaying(playing);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-blue-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header - exactly like screenshot title */}
      <header className="w-full pt-4 pb-2 text-center select-none">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🤖</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-sky-800">
            MÊ CUNG
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          Hãy đưa robot từ <strong className="text-slate-800">BẮT ĐẦU</strong> đến{' '}
          <strong className="text-slate-800">LỐI RA</strong>
        </p>

        {/* Quick Utility Toolbar in top right */}
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-end gap-2 -mt-7 sm:-mt-8">
          <button
            type="button"
            onClick={handleToggleMusic}
            title={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền kịch tính'}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          >
            {isMusicPlaying ? (
              <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden md:inline">{isMusicPlaying ? 'Tắt nhạc' : 'Bật nhạc'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuestionBank(true)}
            className="p-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">24 Câu hỏi Tin học</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 sm:gap-8">
        {/* Left Column: The Maze */}
        <div className="w-full lg:flex-1 flex justify-center">
          <MazeBoard
            grid={maze.grid}
            robotPos={robotPos}
            startPos={maze.start}
            exitPos={maze.exit}
            obstacles={maze.obstacles}
            activeObstacleId={activeObstacle?.id ?? null}
          />
        </div>

        {/* Right Column: Controls and HUD */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <ControlPanel
            timeSeconds={timeSeconds}
            stepsCount={stepsCount}
            onMove={moveRobot}
            onResetPosition={handleResetPosition}
            onNewMaze={handleNewMaze}
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={handleToggleMusic}
            obstaclesCleared={clearedObstacles.size}
            totalObstacles={maze.obstacleList.length}
          />
        </div>
      </main>

      {/* Question Challenge Modal */}
      {activeObstacle && (
        <QuestionModal
          obstacle={activeObstacle}
          onSuccess={handleAnswerSuccess}
          onClose={() => setActiveObstacle(null)}
        />
      )}

      {/* Victory Celebration Modal */}
      {isWon && (
        <VictoryModal
          timeSeconds={timeSeconds}
          stepsCount={stepsCount}
          obstaclesCleared={clearedObstacles.size}
          totalObstacles={maze.obstacleList.length}
          onRestart={handleResetPosition}
          onNewMaze={handleNewMaze}
        />
      )}

      {/* Question Bank Modal for Reference */}
      {showQuestionBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Bộ 24 Câu Hỏi Tin Học (Quản Lý Tệp & Thư Mục)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionBank(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-100">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="pt-3 first:pt-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      Câu {q.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {q.obstacleType === 'rock' ? '🪨 Khối đá' : '⚡ Bẫy gai'} · {q.topic}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                          opt.key === q.correct
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold underline decoration-emerald-600 underline-offset-4'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setShowQuestionBank(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
