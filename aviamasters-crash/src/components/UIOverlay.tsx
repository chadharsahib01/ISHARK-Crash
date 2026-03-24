import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { TrendingUp, Navigation, Ruler, Wallet, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface UIOverlayProps {
  multiplier: number;
  altitude: number;
  distance: number;
  gameState: 'IDLE' | 'FLYING' | 'CRASHED';
  balance: number;
  bet: number;
  onBetChange: (val: number) => void;
  onStart: () => void;
  onCashOut: () => void;
}

export const UIOverlay = ({
  multiplier,
  altitude,
  distance,
  gameState,
  balance,
  bet,
  onBetChange,
  onStart,
  onCashOut
}: UIOverlayProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 font-orbitron @container">
      <LayoutGroup>
        {/* Top Stats */}
        <motion.div 
          layout
          className="flex flex-col md:flex-row justify-between items-start gap-4"
        >
          <motion.div 
            layout
            className="glass p-4 rounded-2xl flex gap-6 pointer-events-auto @md:flex-row flex-col"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Navigation size={10} /> Altitude
              </span>
              <span className="text-xl font-bold text-white font-mono">
                {altitude.toLocaleString()}m
              </span>
            </div>
            <div className="hidden @md:block w-px h-8 bg-white/10 self-center" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Ruler size={10} /> Distance
              </span>
              <span className="text-xl font-bold text-white font-mono">
                {distance.toLocaleString()}m
              </span>
            </div>
          </motion.div>

          <motion.div 
            layout
            className="glass p-4 rounded-2xl flex flex-col items-end pointer-events-auto"
          >
            <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Wallet size={10} /> Balance
            </span>
            <span className="text-xl font-bold text-[#00ff9d]">
              ${balance.toFixed(2)}
            </span>
          </motion.div>
        </motion.div>

        {/* Center Multiplier */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full px-4">
          <AnimatePresence mode="wait">
            {gameState === 'CRASHED' ? (
              <motion.div
                key="crashed"
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-red-500 text-5xl md:text-8xl font-black uppercase tracking-tighter text-center"
              >
                Crashed
              </motion.div>
            ) : (
              <motion.div
                key="multiplier"
                layoutId="multiplier"
                className={cn(
                  "text-7xl md:text-9xl font-black tracking-tighter transition-all duration-75 text-center",
                  gameState === 'FLYING' ? "text-[#00ff9d] multiplier-pulse" : "text-white/10"
                )}
                style={{
                  textShadow: gameState === 'FLYING' ? '0 0 40px rgba(0, 255, 157, 0.4)' : 'none'
                }}
              >
                {multiplier.toFixed(2)}x
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Dock */}
        <motion.div 
          layout
          className="flex justify-center mb-4 w-full"
        >
          <motion.div 
            layout
            className="glass p-2 rounded-3xl flex flex-col @md:flex-row items-center gap-4 pointer-events-auto max-w-2xl w-full"
          >
            {/* Bet Controls */}
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl w-full @md:w-auto flex-1">
              <div className="flex flex-col px-2 flex-1">
                <span className="text-[8px] text-white/40 uppercase">Amount</span>
                <input 
                  type="number" 
                  value={bet}
                  onChange={(e) => onBetChange(Number(e.target.value))}
                  className="bg-transparent text-white font-bold outline-none w-full font-mono"
                  disabled={gameState === 'FLYING'}
                />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => onBetChange(Math.max(1, bet / 2))}
                  className="px-3 py-1 hover:bg-white/10 rounded-lg text-xs transition-colors"
                  disabled={gameState === 'FLYING'}
                >
                  1/2
                </button>
                <button 
                  onClick={() => onBetChange(bet * 2)}
                  className="px-3 py-1 hover:bg-white/10 rounded-lg text-xs transition-colors"
                  disabled={gameState === 'FLYING'}
                >
                  2x
                </button>
              </div>
            </div>

            {/* Action Button */}
            <AnimatePresence mode="wait">
              {gameState === 'FLYING' ? (
                <motion.button
                  key="cashout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCashOut}
                  className="bg-[#00ff9d] text-black h-16 px-8 @md:px-12 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,157,0.4)] transition-all animate-pulse w-full @md:w-auto"
                >
                  <Zap size={20} fill="currentColor" />
                  <span className="hidden @sm:inline">Cash Out</span>
                  <span className="ml-2 opacity-60 font-mono">
                    ${(bet * multiplier).toFixed(2)}
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  key="bet"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStart}
                  disabled={gameState === 'CRASHED'}
                  className={cn(
                    "h-16 px-8 @md:px-12 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all w-full @md:w-auto",
                    gameState === 'CRASHED' 
                      ? "bg-white/5 text-white/20 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-[#00ff9d] hover:shadow-[0_0_30px_rgba(0,255,157,0.4)]"
                  )}
                >
                  <TrendingUp size={20} />
                  <span>Place Bet</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
