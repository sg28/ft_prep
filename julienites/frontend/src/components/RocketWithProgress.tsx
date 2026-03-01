import React from 'react';
import { Rocket } from 'lucide-react';

interface RocketWithProgressProps {
  /** Progress percentage (0-100) */
  progress?: number;
  /** Size of the component in pixels */
  size?: number;
  /** Color of the progress arc */
  progressColor?: string;
  /** Color of the remaining circle */
  remainingColor?: string;
  /** Color of the rocket icon */
  rocketColor?: string;
  /** Additional CSS classes */
  className?: string;
}

const RocketWithProgress: React.FC<RocketWithProgressProps> = ({
  progress = 10,
  size = 20,
  progressColor = '#22c55e', // green-500
  remainingColor = '#ef4444', // red-500
  rocketColor = '#eab308', // yellow-500
  className = ''
}) => {
  // Calculate circle properties
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * progress) / 100;
  
  return (
    <span 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Circular progress background */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 20 20"
      >
        {/* Remaining circle */}
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke={remainingColor}
          strokeWidth="1.5"
          strokeDasharray={circumference}
          strokeDashoffset="0"
          transform="rotate(-90 10 10)"
        />
        {/* Progress arc */}
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth="1.5"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          transform="rotate(-90 10 10)"
        />
      </svg>
      
      {/* Rocket icon in center */}
      <Rocket 
        size={size * 0.5} // Rocket is 50% of container size
        className="relative"
        style={{ color: rocketColor }}
      />
    </span>
  );
};

export default RocketWithProgress;