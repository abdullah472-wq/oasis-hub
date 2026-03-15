const WaveDivider = ({ 
  className = "", 
  flip = false, 
  color = "fill-background" 
}: { 
  className?: string; 
  flip?: boolean; 
  color?: string;
}) => (
  <div className={`relative w-full overflow-hidden h-16 md:h-24 ${flip ? "rotate-180" : ""} ${className}`}>
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`absolute bottom-0 w-full h-full ${color}`}>
      <path d="M0,64 C240,120 480,20 720,64 C960,108 1200,20 1440,64 V120 H0 Z" />
    </svg>
  </div>
);

export default WaveDivider;
