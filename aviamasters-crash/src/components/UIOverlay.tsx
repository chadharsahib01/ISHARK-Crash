import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 font-orbitron">
      {/* Top Stats */}
      <div className="flex justify-between items-start">
        <div className="glass p-4 rounded-2xl flex gap-6 pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Navigation size={10} /> Altitude
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {altitude.toLocaleString()}m
            </span>
          </div>
          <div className="w-px h-8 bg-white/10 self-center" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
              <Ruler size={10} /> Distance
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {distance.toLocaleString()}m
            </span>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col items-end pointer-events-auto">
          <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
            <Wallet size={10} /> Balance
          </span>
          <span className="text-xl font-bold text-[#00ff9d]">
            ${balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Center Multiplier */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {gameState === 'CRASHED' ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-red-500 text-6xl font-black uppercase tracking-tighter"
            >
              Crashed
            </motion.div>
          ) : (
            <motion.div
              key="multiplier"
              className={cn(
                "text-8xl font-black tracking-tighter transition-all duration-75",
                gameState === 'FLYING' ? "text-[#00ff9d] multiplier-pulse" : "text-white/20"
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
      <div className="flex justify-center mb-4">
        <div className="glass p-2 rounded-3xl flex items-center gap-4 pointer-events-auto max-w-2xl w-full">
          {/* Bet Controls */}
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl flex-1">
            <div className="flex flex-col px-2">
              <span className="text-[8px] text-white/40 uppercase">Amount</span>
              <input 
                type="number" 
                value={bet}
                onChange={(e) => onBetChange(Number(e.target.value))}
                className="bg-transparent text-white font-bold outline-none w-20 font-mono"
                disabled={gameState === 'FLYING'}
              />
            </div>
            <button 
              onClick={() => onBetChange(bet / 2)}
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

          {/* Action Button */}
          {gameState === 'FLYING' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCashOut}
              className="bg-[#00ff9d] text-black h-16 px-12 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,157,0.4)] transition-all animate-pulse"
            >
              <Zap size={20} fill="currentColor" />
              Cash Out
              <span className="ml-2 opacity-60 font-mono">
                ${(bet * multiplier).toFixed(2)}
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              disabled={gameState === 'CRASHED'}
              className={cn(
                "h-16 px-12 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                gameState === 'CRASHED' 
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-[#00ff9d] hover:shadow-[0_0_30px_rgba(0,255,157,0.4)]"
              )}
            >
              <TrendingUp size={20} />
              Place Bet
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
