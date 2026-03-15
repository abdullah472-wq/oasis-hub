const WaveDivider = ({
  className = "",
  flip = false,
  color = "fill-background"




}: {className?: string;flip?: boolean;color?: string;}) =>
<div className={`relative w-full overflow-hidden h-16 md:h-24 ${flip ? "rotate-180" : ""} ${className}`}>
    

  
  </div>;


export default WaveDivider;