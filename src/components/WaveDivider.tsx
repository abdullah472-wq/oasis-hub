const WaveDivider = ({
  className = "",
  flip = false,
  color = "fill-background",
}: { className?: string; flip?: boolean; color?: string }) => {
  return (
    <svg
      className={`pointer-events-none block h-16 w-full md:h-20 ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className={color}
        d="M0,36 C180,68 360,74 540,54 C720,34 900,8 1080,24 C1230,38 1335,56 1440,44 L1440,80 L0,80 Z"
      />
    </svg>
  );
};

export default WaveDivider;
