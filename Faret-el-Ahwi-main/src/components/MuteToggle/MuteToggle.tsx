import React from 'react';
import { useGameStore } from '../../engine/gameStore';
import { Volume2, VolumeX } from 'lucide-react';

export interface MuteToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({
  className = '',
  showLabel = true,
}) => {
  const muted = useGameStore((state) => state.muted);
  const toggleMuted = useGameStore((state) => state.toggleMuted);

  return (
    <button
      type="button"
      id="sound-mute-toggle-btn"
      onClick={toggleMuted}
      className={`min-h-[36px] px-2.5 py-1.5 rounded-xl border border-app-border bg-app-surface text-app-text hover:bg-app-surface-alt active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer select-none ${
        muted ? 'text-app-muted opacity-80' : 'text-coffee-800 dark:text-coffee-100'
      } ${className}`}
      aria-label={muted ? 'تفعيل الصوت • Unmute sound' : 'كتم الصوت • Mute sound'}
      title={muted ? 'الصوت مكتوم (اضغط للتفعيل)' : 'الصوت مفعل (اضغط للكتم)'}
    >
      {muted ? (
        <VolumeX className="w-4 h-4 text-app-muted stroke-[2]" />
      ) : (
        <Volume2 className="w-4 h-4 text-leb-green stroke-[2]" />
      )}
      {showLabel && (
        <span className="text-xs font-bold font-sans">
          {muted ? 'مكتوم' : 'صوت'}
        </span>
      )}
    </button>
  );
};

export default MuteToggle;
