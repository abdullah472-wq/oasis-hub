const WaveDivider = ({
  className = "",
  flip = false,
  color = "fill-background",
}: { className?: string; flip?: boolean; color?: string }) => {
  return (
    <svg
      className={`w-full ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={color}
        d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
      />
    </svg>
  );
};

export default WaveDivider;