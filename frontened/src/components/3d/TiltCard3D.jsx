import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard3D — High-performance 3D perspective tilt card
 * Adds physical depth, specular light sheen, and layered depth effects.
 */
export default function TiltCard3D({
  children,
  className = '',
  maxTilt = 14,
  scale = 1.03,
  glare = true,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = (e.clientX - rect.left) / rect.width;
    const clientY = (e.clientY - rect.top) / rect.height;
    x.set(clientX);
    y.set(clientY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={`relative cursor-pointer transition-shadow select-none ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full h-full relative rounded-2xl overflow-hidden"
      >
        {children}

        {/* Dynamic Specular Light Glare */}
        {glare && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-40 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 280px at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.45), transparent 80%)`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
