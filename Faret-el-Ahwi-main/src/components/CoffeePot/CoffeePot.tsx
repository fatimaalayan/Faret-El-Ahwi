import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface CoffeePotProps {
  tension?: number; // 0 to 1
  flameOn?: boolean; // true during active round
  boiledOver?: boolean; // true on timeout/overflow
  className?: string;
  size?: number | string;
}

export const CoffeePot: React.FC<CoffeePotProps> = ({
  tension = 0,
  flameOn = false,
  boiledOver = false,
  className = '',
}) => {
  // Normalize tension to 0-1 range
  const clampedTension = Math.min(1, Math.max(0, tension));
  const isIdle = clampedTension === 0 && !flameOn && !boiledOver;
  const isSimmering = clampedTension > 0 && clampedTension <= 0.45 && !boiledOver;
  const isHeating = clampedTension > 0.45 && clampedTension <= 0.8 && !boiledOver;
  const isBoiling = clampedTension > 0.8 && !boiledOver;

  // Shake animation configuration based on tension
  const getShakeAnimation = () => {
    if (boiledOver) {
      return {
        rotate: [0, -6, 6, -5, 5, -2, 2, 0],
        y: [0, -6, 2, -5, 3, -1, 0],
        scale: [1, 1.08, 0.96, 1.05, 1],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        },
      };
    }
    if (isBoiling) {
      return {
        rotate: [-3.5, 3.5, -2.5, 2.5, -3, 3],
        y: [-2, 2, -1, 1, -2, 2],
        scale: [1, 1.03, 0.99, 1.02, 1],
        transition: {
          duration: 0.22,
          repeat: Infinity,
          repeatType: 'mirror' as const,
        },
      };
    }
    if (isHeating) {
      return {
        rotate: [-1.8, 1.8, -1.2, 1.2],
        y: [-1, 1, -0.5, 0.5],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          repeatType: 'mirror' as const,
        },
      };
    }
    if (isSimmering) {
      return {
        rotate: [-0.8, 0.8],
        transition: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'mirror' as const,
        },
      };
    }
    return { rotate: 0, y: 0, scale: 1 };
  };

  return (
    <div
      id="coffee-pot-mascot"
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: '190px', height: '190px' }}
      aria-label="شخصية ركوة القهوة اللبنانية الكرتونية"
    >
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Copper Body Gradient */}
          <linearGradient id="copperBody" x1="60" y1="70" x2="180" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F99F5E" />
            <stop offset="35%" stopColor="#E26D28" />
            <stop offset="75%" stopColor="#C44B12" />
            <stop offset="100%" stopColor="#8C2C05" />
          </linearGradient>

          {/* Copper Rim Gradient */}
          <linearGradient id="brassRim" x1="75" y1="65" x2="165" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Wood Handle Gradient */}
          <linearGradient id="woodHandle" x1="150" y1="90" x2="220" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#854D0E" />
            <stop offset="40%" stopColor="#713F12" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Coffee Surface / Froth */}
          <radialGradient id="coffeeFroth" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C79D" />
            <stop offset="55%" stopColor="#A0693B" />
            <stop offset="100%" stopColor="#381D0D" />
          </radialGradient>

          {/* Cartoon Steam Gradient */}
          <linearGradient id="steamGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Cartoon Flame Gradients */}
          <radialGradient id="flameCore" cx="50%" cy="75%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" />
          </radialGradient>
        </defs>

        {/* 1. CARTOON STEAM (From Spout) */}
        {!isIdle && (
          <g id="steam-layer" className="pointer-events-none">
            {/* Steam Wisp 1 */}
            <motion.path
              d="M 46 68 C 30 50, 48 35, 34 18 C 28 10, 36 4, 30 0"
              stroke="url(#steamGradient)"
              strokeWidth={isBoiling || boiledOver ? 7 : isHeating ? 5 : 3.5}
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  'M 46 68 C 30 50, 48 35, 34 18 C 28 10, 36 4, 30 0',
                  'M 46 68 C 42 48, 25 32, 40 16 C 45 8, 38 2, 42 -4',
                  'M 46 68 C 30 50, 48 35, 34 18 C 28 10, 36 4, 30 0',
                ],
                opacity: isBoiling || boiledOver ? [0.6, 0.95, 0.6] : [0.4, 0.75, 0.4],
                y: [0, -8, 0],
              }}
              transition={{
                duration: isBoiling || boiledOver ? 0.7 : isHeating ? 1.2 : 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Steam Wisp 2 */}
            <motion.path
              d="M 52 64 C 42 45, 60 32, 48 16 C 42 8, 52 2, 46 -2"
              stroke="url(#steamGradient)"
              strokeWidth={isBoiling || boiledOver ? 6 : 4}
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  'M 52 64 C 42 45, 60 32, 48 16 C 42 8, 52 2, 46 -2',
                  'M 52 64 C 55 42, 38 28, 56 12 C 59 6, 50 0, 54 -6',
                  'M 52 64 C 42 45, 60 32, 48 16 C 42 8, 52 2, 46 -2',
                ],
                opacity: [0.3, 0.85, 0.3],
                y: [0, -10, 0],
              }}
              transition={{
                duration: isBoiling || boiledOver ? 0.6 : isHeating ? 1.0 : 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />

            {/* Little Steam Puff Circles when heating/boiling */}
            {(isHeating || isBoiling || boiledOver) && (
              <>
                <motion.circle
                  cx="38"
                  cy="42"
                  r={isBoiling ? 6 : 4}
                  fill="#FFFBEB"
                  animate={{
                    y: [0, -28],
                    x: [0, -10],
                    scale: [0.6, 1.4],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: isBoiling ? 0.6 : 1,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.circle
                  cx="48"
                  cy="32"
                  r={isBoiling ? 7 : 4.5}
                  fill="#FEF3C7"
                  animate={{
                    y: [0, -32],
                    x: [0, 8],
                    scale: [0.7, 1.5],
                    opacity: [0.85, 0],
                  }}
                  transition={{
                    duration: isBoiling ? 0.7 : 1.1,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0.35,
                  }}
                />
              </>
            )}
          </g>
        )}

        {/* 2. CARTOON FLAME UNDER POT */}
        {flameOn && clampedTension > 0 && !boiledOver && (
          <g id="flame-layer">
            {/* Stove burner ring support */}
            <path
              d="M 75 204 L 165 204"
              stroke="#4B2412"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Animated cartoon flame */}
            <motion.g
              animate={{
                scaleY: isBoiling ? [1.1, 1.45, 1.05, 1.4, 1.1] : isHeating ? [0.9, 1.2, 0.95, 1.15] : [0.7, 0.9, 0.75],
                scaleX: isBoiling ? [1.05, 0.95, 1.08, 0.98] : [0.95, 1.05, 0.98],
              }}
              style={{ originX: '120px', originY: '210px' }}
              transition={{
                duration: isBoiling ? 0.25 : 0.45,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Outer Red Flame */}
              <path
                d="M 85 204 C 82 190, 95 180, 102 184 C 108 174, 120 162, 120 162 C 120 162, 132 174, 138 184 C 145 180, 158 190, 155 204 C 150 214, 90 214, 85 204 Z"
                fill="url(#flameCore)"
                stroke="#B91C1C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Inner Bright Golden Flame */}
              <path
                d="M 98 203 C 96 195, 105 188, 110 190 C 114 182, 120 174, 120 174 C 120 174, 126 182, 130 190 C 135 188, 144 195, 142 203 C 138 209, 102 209, 98 203 Z"
                fill="#FEF08A"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </motion.g>
          </g>
        )}

        {/* 3. MAIN RAKWEH CHARACTER BODY (Shakes with tension) */}
        <motion.g
          id="rakweh-body-group"
          animate={getShakeAnimation()}
          style={{ originX: '120px', originY: '170px' }}
        >
          {/* POT SHADOW (Underneath base) */}
          <ellipse cx="120" cy="199" rx="46" ry="6" fill="#2E160C" opacity="0.3" />

          {/* WOODEN HANDLE (Classic Arabic angled handle on right) */}
          <g id="rakweh-handle">
            {/* Metal connector bracket on pot neck */}
            <path
              d="M 148 108 L 165 102 L 168 116 L 148 118 Z"
              fill="#D97706"
              stroke="#2B1810"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Two cute rivets on bracket */}
            <circle cx="156" cy="107" r="1.8" fill="#FDE68A" stroke="#2B1810" strokeWidth="1" />
            <circle cx="158" cy="113" r="1.8" fill="#FDE68A" stroke="#2B1810" strokeWidth="1" />

            {/* Long angled wooden handle body */}
            <path
              d="M 164 103 L 214 62 C 220 57, 226 63, 222 68 L 170 114 Z"
              fill="url(#woodHandle)"
              stroke="#2B1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Cute wooden handle highlight line */}
            <path
              d="M 172 101 L 212 67"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Rounded wooden tip knob */}
            <ellipse
              cx="217"
              cy="65"
              rx="4"
              ry="5"
              fill="#F59E0B"
              stroke="#2B1810"
              strokeWidth="2.5"
              transform="rotate(-38 217 65)"
            />
          </g>

          {/* MAIN POT BODY & SPOUT */}
          {/* Classic curved Lebanese Rakweh silhouette */}
          <g id="pot-body">
            {/* Main bulbous copper body + long curved spout */}
            <path
              d="
                M 82 82
                C 76 82, 60 76, 48 70
                C 42 67, 39 71, 44 76
                C 54 86, 68 100, 76 112
                C 64 128, 62 152, 68 170
                C 74 186, 92 196, 120 196
                C 148 196, 166 186, 172 170
                C 178 152, 176 128, 164 112
                C 160 102, 158 92, 158 82
                Z
              "
              fill="url(#copperBody)"
              stroke="#2B1810"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Body Warm 2D Highlight (Kawaii curved shine) */}
            <path
              d="M 78 138 C 74 152, 78 172, 92 184 C 95 186, 98 184, 96 181 C 86 171, 82 154, 85 140 C 86 136, 80 134, 78 138 Z"
              fill="#FED7AA"
              opacity="0.6"
            />

            {/* Spout Rim opening */}
            <ellipse
              cx="44"
              cy="73"
              rx="4.5"
              ry="7"
              fill="#451A03"
              stroke="#2B1810"
              strokeWidth="2.5"
              transform="rotate(-28 44 73)"
            />

            {/* Wide Flared Top Rim */}
            <ellipse
              cx="120"
              cy="82"
              rx="38"
              ry="11"
              fill="url(#brassRim)"
              stroke="#2B1810"
              strokeWidth="3.5"
            />

            {/* Coffee inside the rim */}
            <ellipse
              cx="120"
              cy="83"
              rx="33"
              ry="8.5"
              fill="url(#coffeeFroth)"
              stroke="#2B1810"
              strokeWidth="2"
            />

            {/* Tiny coffee bubbles on top froth */}
            <circle cx="110" cy="83" r="2.2" fill="#FEF3C7" opacity="0.8" />
            <circle cx="126" cy="82" r="2.8" fill="#FEF3C7" opacity="0.9" />
            <circle cx="138" cy="84" r="1.8" fill="#FEF3C7" opacity="0.8" />
            <circle cx="102" cy="84" r="1.5" fill="#FEF3C7" opacity="0.7" />

            {/* Brass decorative neck band */}
            <path
              d="M 86 102 C 104 107, 136 107, 154 102"
              stroke="#FDE68A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* 4. CUTE MASCOT CHARACTER FACE */}
          <g id="rakweh-face">
            {/* Blushing Cheeks */}
            <motion.ellipse
              cx="94"
              cy="154"
              rx={isBoiling || boiledOver ? 8 : 6.5}
              ry={isBoiling || boiledOver ? 5 : 4}
              fill={isBoiling || boiledOver ? '#EF4444' : '#F87171'}
              opacity={isIdle ? 0.45 : isBoiling || boiledOver ? 0.9 : 0.7}
              animate={{
                scale: isBoiling || boiledOver ? [1, 1.25, 1] : 1,
              }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
            <motion.ellipse
              cx="146"
              cy="154"
              rx={isBoiling || boiledOver ? 8 : 6.5}
              ry={isBoiling || boiledOver ? 5 : 4}
              fill={isBoiling || boiledOver ? '#EF4444' : '#F87171'}
              opacity={isIdle ? 0.45 : isBoiling || boiledOver ? 0.9 : 0.7}
              animate={{
                scale: isBoiling || boiledOver ? [1, 1.25, 1] : 1,
              }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />

            {/* EYES & BROWS - Dynamic based on state */}
            {isIdle && (
              /* SLEEPY / CALM (tension = 0) */
              <g id="face-sleepy">
                {/* Cute curved closed eyes (happy/sleepy arcs) */}
                <path
                  d="M 98 144 C 102 140, 110 140, 114 144"
                  stroke="#2B1810"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 126 144 C 130 140, 138 140, 142 144"
                  stroke="#2B1810"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Peaceful relaxed mouth */}
                <path
                  d="M 117 155 C 119 157, 122 157, 124 155"
                  stroke="#2B1810"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {isSimmering && (
              /* CURIOUS & ALERT (0 < tension <= 0.45) */
              <g id="face-simmering">
                {/* Left Eye */}
                <circle cx="106" cy="144" r="7.5" fill="#2B1810" />
                <circle cx="104" cy="141.5" r="2.8" fill="#FFFFFF" />
                <circle cx="108.5" cy="146.5" r="1.4" fill="#FFFFFF" />

                {/* Right Eye */}
                <circle cx="134" cy="144" r="7.5" fill="#2B1810" />
                <circle cx="132" cy="141.5" r="2.8" fill="#FFFFFF" />
                <circle cx="136.5" cy="146.5" r="1.4" fill="#FFFFFF" />

                {/* Cute Smile */}
                <path
                  d="M 116 154 C 118 158, 123 158, 125 154"
                  stroke="#2B1810"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {isHeating && (
              /* NERVOUS / CONCERNED (0.45 < tension <= 0.8) */
              <g id="face-heating">
                {/* Concerned Eyebrows */}
                <path d="M 98 134 L 112 137" stroke="#2B1810" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 142 134 L 128 137" stroke="#2B1810" strokeWidth="2.8" strokeLinecap="round" />

                {/* Wide Eyes */}
                <circle cx="106" cy="144" r="8.5" fill="#2B1810" />
                <circle cx="103.5" cy="141" r="3" fill="#FFFFFF" />
                <circle cx="109" cy="147" r="1.5" fill="#FFFFFF" />

                <circle cx="134" cy="144" r="8.5" fill="#2B1810" />
                <circle cx="131.5" cy="141" r="3" fill="#FFFFFF" />
                <circle cx="137" cy="147" r="1.5" fill="#FFFFFF" />

                {/* Nervous "o" mouth */}
                <ellipse cx="120" cy="156" rx="4" ry="5.5" fill="#2B1810" />
                <ellipse cx="120" cy="158" rx="2.5" ry="2" fill="#F87171" />

                {/* Blue Sweat Drop on temple */}
                <motion.path
                  d="M 152 132 C 152 132, 156 138, 156 141 C 156 143.5, 154 145, 151.5 145 C 149 145, 147 143.5, 147 141 C 147 138, 152 132, 152 132 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </g>
            )}

            {isBoiling && (
              /* PANICKED / SCREAMING (0.8 < tension < 1) */
              <g id="face-boiling">
                {/* Angled High-Tension Eyebrows */}
                <path d="M 96 130 L 112 136" stroke="#2B1810" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M 144 130 L 128 136" stroke="#2B1810" strokeWidth="3.2" strokeLinecap="round" />

                {/* Big Trembling Eyes */}
                <motion.g
                  animate={{ scale: [1, 1.08, 0.95, 1] }}
                  transition={{ duration: 0.25, repeat: Infinity }}
                >
                  <circle cx="105" cy="144" r="10" fill="#FFFFFF" stroke="#2B1810" strokeWidth="2.5" />
                  <circle cx="105" cy="144" r="5" fill="#2B1810" />
                  <circle cx="103" cy="142" r="2" fill="#FFFFFF" />

                  <circle cx="135" cy="144" r="10" fill="#FFFFFF" stroke="#2B1810" strokeWidth="2.5" />
                  <circle cx="135" cy="144" r="5" fill="#2B1810" />
                  <circle cx="133" cy="142" r="2" fill="#FFFFFF" />
                </motion.g>

                {/* Shocked Open Screaming Mouth */}
                <path
                  d="M 112 153 C 112 148, 128 148, 128 153 C 128 164, 112 164, 112 153 Z"
                  fill="#2B1810"
                  stroke="#2B1810"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Tongue */}
                <ellipse cx="120" cy="160" rx="5" ry="3" fill="#EF4444" />

                {/* Flying Sweat Drops */}
                <motion.path
                  d="M 154 128 C 154 128, 159 135, 159 138 C 159 141, 156.5 143, 154 143 C 151.5 143, 149 141, 149 138 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  animate={{ y: [-2, 6, -2], x: [0, 4, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity }}
                />
                <motion.path
                  d="M 86 128 C 86 128, 81 135, 81 138 C 81 141, 83.5 143, 86 143 C 88.5 143, 91 141, 91 138 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  animate={{ y: [-2, 6, -2], x: [0, -4, 0] }}
                  transition={{ duration: 0.35, repeat: Infinity, delay: 0.15 }}
                />
              </g>
            )}

            {boiledOver && (
              /* BOILED OVER / EXPLODED PANIC */
              <g id="face-boiled-over">
                {/* Shocked / Dizzy X Eyes */}
                <g stroke="#2B1810" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="99" y1="138" x2="111" y2="150" />
                  <line x1="111" y1="138" x2="99" y2="150" />

                  <line x1="129" y1="138" x2="141" y2="150" />
                  <line x1="141" y1="138" x2="129" y2="150" />
                </g>

                {/* Screaming Wide Panicked Mouth */}
                <ellipse cx="120" cy="158" rx="10" ry="11" fill="#2B1810" />
                <ellipse cx="120" cy="164" rx="7" ry="4" fill="#EF4444" />
                {/* Little cute upper tooth */}
                <rect x="117" y="148" width="6" height="4" rx="1.5" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* 5. BOILED OVER COFFEE ERUPTION & OVERFLOW FX */}
          {boiledOver && (
            <g id="boiled-over-layer">
              {/* Coffee Froth Mounds Spilling Over The Rim */}
              <motion.path
                d="
                  M 80 82
                  C 75 66, 92 60, 102 68
                  C 112 55, 130 55, 140 68
                  C 150 62, 165 68, 160 82
                  C 168 94, 162 110, 154 114
                  C 148 112, 148 95, 140 92
                  C 130 92, 125 105, 118 105
                  C 110 105, 106 94, 98 94
                  C 90 94, 86 112, 80 110
                  C 72 105, 74 92, 80 82 Z
                "
                fill="#FDE68A"
                stroke="#2B1810"
                strokeWidth="3"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.9, 1.15, 1.05], opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Dark Rich Coffee Drops Dripping Down Sides */}
              <motion.path
                d="M 85 96 C 85 118, 80 130, 82 135 C 84 138, 88 138, 89 135 C 91 126, 90 105, 90 96 Z"
                fill="#451A03"
                stroke="#2B1810"
                strokeWidth="1.5"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              />
              <motion.path
                d="M 152 96 C 152 120, 158 132, 156 137 C 154 140, 150 140, 149 137 C 147 128, 148 105, 148 96 Z"
                fill="#451A03"
                stroke="#2B1810"
                strokeWidth="1.5"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              />

              {/* Splashing Droplets in Air */}
              <motion.circle
                cx="70"
                cy="55"
                r="4.5"
                fill="#451A03"
                stroke="#2B1810"
                strokeWidth="1.5"
                animate={{ y: [-15, 5], x: [-15, -5], scale: [1, 0.8] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
              />
              <motion.circle
                cx="170"
                cy="52"
                r="5"
                fill="#451A03"
                stroke="#2B1810"
                strokeWidth="1.5"
                animate={{ y: [-18, 6], x: [16, 6], scale: [1, 0.8] }}
                transition={{ duration: 0.45, repeat: Infinity, repeatType: 'reverse', delay: 0.1 }}
              />
              <motion.circle
                cx="120"
                cy="42"
                r="4"
                fill="#FDE68A"
                stroke="#2B1810"
                strokeWidth="1.5"
                animate={{ y: [-24, 0], scale: [0.8, 1.2] }}
                transition={{ duration: 0.38, repeat: Infinity, repeatType: 'reverse' }}
              />

              {/* Big Cartoon Steam Burst Cloud */}
              <motion.g
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.95, 1.2, 1.05], opacity: [0.8, 1, 0.9] }}
                transition={{ duration: 0.3 }}
              >
                <circle cx="100" cy="45" r="14" fill="#FFFFFF" stroke="#2B1810" strokeWidth="2.5" />
                <circle cx="120" cy="35" r="18" fill="#FFFFFF" stroke="#2B1810" strokeWidth="2.5" />
                <circle cx="142" cy="45" r="15" fill="#FFFFFF" stroke="#2B1810" strokeWidth="2.5" />
              </motion.g>
            </g>
          )}
        </motion.g>
      </svg>
    </div>
  );
};

export default CoffeePot;
