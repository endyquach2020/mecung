import React from 'react';
import { CellCoord, Obstacle } from '../utils/mazeGenerator';

interface MazeBoardProps {
  grid: number[][];
  robotPos: CellCoord;
  startPos: CellCoord;
  exitPos: CellCoord;
  obstacles: Map<string, Obstacle>;
  activeObstacleId: number | null;
  onCellClick?: (r: number, c: number) => void;
}

export const MazeBoard: React.FC<MazeBoardProps> = ({
  grid,
  robotPos,
  startPos,
  exitPos,
  obstacles,
  activeObstacleId,
}) => {
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div className="flex flex-col items-center w-full max-w-[620px] mx-auto select-none">
      {/* Maze Container */}
      <div className="w-full aspect-square p-2.5 sm:p-3.5 bg-white rounded-2xl shadow-lg border border-slate-200">
        <div
          className="w-full h-full grid rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900 shadow-inner"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cellType, c) => {
              const isWall = cellType === 1;
              const isRobot = robotPos.r === r && robotPos.c === c;
              const isStart = startPos.r === r && startPos.c === c;
              const isExit = exitPos.r === r && exitPos.c === c;
              const key = `${r},${c}`;
              const obstacle = obstacles.get(key);
              const isTargetedObstacle = obstacle && obstacle.id === activeObstacleId;

              if (isWall) {
                // Wall Cell - matching screenshot dark navy grid
                return (
                  <div
                    key={key}
                    className="w-full h-full bg-[#182338] border-[0.5px] border-[#22324f]/60"
                  />
                );
              }

              // Walkable Passage Cell
              return (
                <div
                  key={key}
                  className={`w-full h-full relative flex items-center justify-center border-[0.5px] border-slate-200/50 transition-colors ${
                    isExit
                      ? 'bg-rose-100/90'
                      : isStart
                      ? 'bg-emerald-50/90'
                      : 'bg-[#fafbfc]'
                  }`}
                >
                  {/* Exit marker "E" matching screenshot */}
                  {isExit && (
                    <div className="w-full h-full flex items-center justify-center bg-rose-500/20 text-rose-600 font-extrabold text-[10px] sm:text-xs">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-rose-500 text-white flex items-center justify-center font-bold text-[9px] sm:text-[11px] shadow-xs">
                        E
                      </span>
                    </div>
                  )}

                  {/* Start marker subtle indicator if robot moved away */}
                  {isStart && !isRobot && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 border border-emerald-600" />
                  )}

                  {/* Obstacles */}
                  {obstacle && (
                    <div
                      className={`relative w-full h-full flex items-center justify-center ${
                        isTargetedObstacle ? 'animate-bounce' : ''
                      }`}
                      title={
                        obstacle.cleared
                          ? 'Đã vượt qua'
                          : obstacle.type === 'rock'
                          ? `Khối đá chắn đường (Câu ${obstacle.questionId})`
                          : `Bẫy gai nguy hiểm (Câu ${obstacle.questionId})`
                      }
                    >
                      {obstacle.cleared ? (
                        // Cleared obstacle icon
                        <div className="w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
                      ) : obstacle.type === 'rock' ? (
                        // Rock Boulder
                        <div className="relative group flex items-center justify-center w-full h-full">
                          <span className="text-xs sm:text-sm select-none filter drop-shadow-sm transition-transform group-hover:scale-125">
                            🪨
                          </span>
                          {/* Mini question indicator */}
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-600 text-[8px] text-white rounded-full flex items-center justify-center font-mono">
                            {obstacle.questionId}
                          </span>
                        </div>
                      ) : (
                        // Spike Trap
                        <div className="relative group flex items-center justify-center w-full h-full">
                          <span className="text-xs sm:text-sm select-none filter drop-shadow-sm transition-transform group-hover:scale-125">
                            ⚡
                          </span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 text-[8px] text-white rounded-full flex items-center justify-center font-mono">
                            {obstacle.questionId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Robot Avatar */}
                  {isRobot && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center transition-all duration-150">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-500 flex items-center justify-center shadow-md ring-2 ring-blue-300 ring-offset-1 text-xs animate-pulse">
                        <span className="text-[11px] sm:text-xs">🤖</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Instruction text box below maze - matching screenshot */}
      <div className="w-full mt-3 p-2.5 px-4 bg-sky-50/80 rounded-xl border border-sky-100 text-sky-800 text-xs sm:text-sm text-center">
        Dùng phím mũi tên trên bàn phím hoặc các nút điều khiển bên phải.
      </div>

      {/* Legend below maze */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
          <span>Bắt đầu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 inline-block" />
          <span>Lối ra</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🪨</span>
          <span>Khối đá (12)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚡</span>
          <span>Bẫy gai (12)</span>
        </div>
      </div>
    </div>
  );
};
