import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface WardlingCharacterProps {
  variant?: 'hero' | 'sleeping' | 'holding-seed' | 'scout';
  className?: string;
  size?: number;
}

export const WardlingCharacter: React.FC<WardlingCharacterProps> = ({
  variant = 'hero',
  className = '',
  size = 180
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Blinking loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      const nextBlink = Math.random() * 4000 + 2500;
      timeoutId = setTimeout(triggerBlink, nextBlink);
    };
    timeoutId = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Eye cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const maxDistance = 120;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const factor = Math.min(distance, maxDistance) / maxDistance;
      const angle = Math.atan2(dy, dx);

      const maxPupilMove = 6;
      setPupilOffset({
        x: Math.cos(angle) * factor * maxPupilMove,
        y: Math.sin(angle) * factor * maxPupilMove
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (variant === 'sleeping') {
    return (
      <div className={`relative inline-block ${className}`} style={{ width: size, height: size * 0.7 }}>
        <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-md overflow-visible">
          {/* Tree branch or cushion */}
          <path d="M 10 120 Q 100 110 190 120 C 195 120 195 130 190 130 Q 100 125 10 130 Z" fill="#7C5B46" stroke="#2B2B2B" strokeWidth="3" />
          
          {/* Sleeping Wardling Body */}
          <motion.g
            animate={{ scaleY: [1, 1.04, 1], scaleX: [1, 0.98, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Main Round Body */}
            <ellipse cx="100" cy="85" rx="55" ry="42" fill="#D9F5C2" stroke="#2B2B2B" strokeWidth="4" />
            
            {/* Cozy leaf hood/cape */}
            <path d="M 50 70 Q 100 35 150 70 Q 100 45 50 70 Z" fill="#7EBE69" stroke="#2B2B2B" strokeWidth="3" />
            <path d="M 100 42 C 105 25, 125 30, 115 15 C 100 25, 100 35, 100 42 Z" fill="#7EBE69" stroke="#2B2B2B" strokeWidth="3" />

            {/* Closed Sleeping Eyes (Zzz) */}
            <path d="M 80 85 Q 86 91 92 85" fill="none" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M 108 85 Q 114 91 120 85" fill="none" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" />

            {/* Rosy Cheeks */}
            <ellipse cx="73" cy="90" rx="7" ry="5" fill="#F7BFD5" opacity="0.8" />
            <ellipse cx="127" cy="90" rx="7" ry="5" fill="#F7BFD5" opacity="0.8" />
            
            {/* Little Paw */}
            <ellipse cx="100" cy="102" rx="12" ry="8" fill="#B9E89D" stroke="#2B2B2B" strokeWidth="3" />
          </motion.g>

          {/* Floating Zzz */}
          <motion.text
            x="145" y="45"
            fill="#7C5B46"
            className="font-patrick font-bold text-lg"
            animate={{ y: [45, 25, 45], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            Z
          </motion.text>
          <motion.text
            x="160" y="25"
            fill="#7C5B46"
            className="font-patrick font-bold text-sm"
            animate={{ y: [25, 10, 25], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
          >
            z
          </motion.text>
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glowing Seed Aura */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, rgba(126, 190, 105, 0.2) 50%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main SVG Wardling Illustration */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg overflow-visible">
        {/* Tree Stump (for hero variant) */}
        {variant === 'hero' && (
          <g>
            <ellipse cx="100" cy="175" rx="75" ry="20" fill="#654531" stroke="#2B2B2B" strokeWidth="4" />
            <path d="M 25 175 L 30 195 L 170 195 L 175 175 Z" fill="#7C5B46" stroke="#2B2B2B" strokeWidth="4" />
            {/* Stump Wood Rings */}
            <ellipse cx="100" cy="175" rx="60" ry="14" fill="#8D6850" stroke="#2B2B2B" strokeWidth="2" strokeDasharray="4 2" />
            <ellipse cx="100" cy="175" rx="40" ry="9" fill="#9E785E" stroke="#2B2B2B" strokeWidth="2" strokeDasharray="4 2" />
            {/* Tiny Mushrooms on Stump */}
            <path d="M 40 170 C 40 160 50 160 50 170 Z" fill="#F7BFD5" stroke="#2B2B2B" strokeWidth="2" />
            <path d="M 45 170 L 45 175" stroke="#2B2B2B" strokeWidth="2" />
          </g>
        )}

        {/* Breathing Body Group */}
        <motion.g
          animate={{
            y: [0, -4, 0],
            scaleY: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Feet */}
          <ellipse cx="75" cy="155" rx="18" ry="12" fill="#B9E89D" stroke="#2B2B2B" strokeWidth="4" />
          <ellipse cx="125" cy="155" rx="18" ry="12" fill="#B9E89D" stroke="#2B2B2B" strokeWidth="4" />

          {/* Main Cream / Leaf Body */}
          <path
            d="M 50 110 Q 30 70 70 45 Q 100 25 130 45 Q 170 70 150 110 Q 160 150 100 155 Q 40 150 50 110 Z"
            fill="#D9F5C2"
            stroke="#2B2B2B"
            strokeWidth="4.5"
          />

          {/* Belly Patch */}
          <path
            d="M 65 110 Q 100 85 135 110 Q 135 140 100 145 Q 65 140 65 110 Z"
            fill="#FFF9EF"
            stroke="#2B2B2B"
            strokeWidth="3"
          />

          {/* Leaf Crown / Ears */}
          <path
            d="M 60 50 C 35 25, 45 5, 65 20 C 70 25, 65 40, 60 50 Z"
            fill="#7EBE69"
            stroke="#2B2B2B"
            strokeWidth="3.5"
          />
          <path
            d="M 140 50 C 165 25, 155 5, 135 20 C 130 25, 135 40, 140 50 Z"
            fill="#7EBE69"
            stroke="#2B2B2B"
            strokeWidth="3.5"
          />

          {/* Sprout Antennas */}
          <path d="M 100 35 C 95 15, 80 15, 88 5 C 102 5, 102 25, 100 35 Z" fill="#7EBE69" stroke="#2B2B2B" strokeWidth="3" />

          {/* Eyes Group */}
          {isBlinking ? (
            <g>
              <path d="M 72 82 Q 82 88 92 82" stroke="#2B2B2B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 108 82 Q 118 88 128 82" stroke="#2B2B2B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              {/* Eye Whites */}
              <ellipse cx="82" cy="80" rx="13" ry="16" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="4" />
              <ellipse cx="118" cy="80" rx="13" ry="16" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="4" />

              {/* Pupils with Cursor Follow */}
              <motion.g animate={{ x: pupilOffset.x, y: pupilOffset.y }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <ellipse cx="82" cy="80" rx="7" ry="9" fill="#2B2B2B" />
                <ellipse cx="118" cy="80" rx="7" ry="9" fill="#2B2B2B" />
                {/* Shiny Eye Highlights */}
                <circle cx="80" cy="76" r="3" fill="#FFFFFF" />
                <circle cx="116" cy="76" r="3" fill="#FFFFFF" />
                <circle cx="84" cy="83" r="1.5" fill="#FFFFFF" />
                <circle cx="120" cy="83" r="1.5" fill="#FFFFFF" />
              </motion.g>
            </g>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="66" cy="94" rx="8" ry="5" fill="#F7BFD5" opacity="0.85" />
          <ellipse cx="134" cy="94" rx="8" ry="5" fill="#F7BFD5" opacity="0.85" />

          {/* Smiling Mouth */}
          <path d="M 94 92 Q 100 98 106 92" stroke="#2B2B2B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Hands holding Glowing Seed */}
          <ellipse cx="76" cy="118" rx="10" ry="9" fill="#B9E89D" stroke="#2B2B2B" strokeWidth="3" />
          <ellipse cx="124" cy="118" rx="10" ry="9" fill="#B9E89D" stroke="#2B2B2B" strokeWidth="3" />

          {/* Glowing Sanctuary Seed */}
          <motion.g
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Glowing Golden Seed Core */}
            <path
              d="M 100 102 C 90 114, 94 126, 100 128 C 106 126, 110 114, 100 102 Z"
              fill="#FDE047"
              stroke="#2B2B2B"
              strokeWidth="3"
            />
            {/* Seed Leaf Sprout */}
            <path d="M 100 102 Q 95 95 90 98 Q 94 105 100 102 Z" fill="#7EBE69" stroke="#2B2B2B" strokeWidth="2" />
            <path d="M 100 102 Q 105 95 110 98 Q 106 105 100 102 Z" fill="#7EBE69" stroke="#2B2B2B" strokeWidth="2" />
          </motion.g>
        </motion.g>

        {/* Floating Magic Particles around Wardling */}
        <motion.circle
          cx="45" cy="55" r="3" fill="#FDE047"
          animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle
          cx="155" cy="65" r="3" fill="#F7BFD5"
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.7 }}
        />
      </svg>
    </div>
  );
};
