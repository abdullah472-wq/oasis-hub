import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const NasheedPlayer = () => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // Default sound set to 0.15 (15%) as configured
  const [volume, setVolume] = useState(0.15);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Click / Tap Outside detection to collapse player
  useEffect(() => {
    if (!isExpanded) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isExpanded]);

  // Autoplay handler on site entrance + robust user gesture fallback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.loop = true;

    // Reset session paused flag so fresh reloads/visits always attempt autoplay
    sessionStorage.removeItem("annoor_nasheed_paused");

    let isStarted = false;

    const startPlaying = () => {
      if (isStarted || !audioRef.current) return;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isStarted = true;
            setIsPlaying(true);
            cleanupListeners();
          })
          .catch(() => {
            // Browser autoplay policy blocked unmuted sound; waiting for first interaction
            setIsPlaying(false);
          });
      }
    };

    const handleUserInteraction = () => {
      startPlaying();
    };

    const cleanupListeners = () => {
      document.removeEventListener("pointerdown", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    // 1. Try immediate unmuted autoplay (succeeds if browser allows or MEI is high)
    startPlaying();

    // 2. Attach global user activation listeners - any click, tap or key will trigger audio
    document.addEventListener("pointerdown", handleUserInteraction);
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction, { passive: true });
    document.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("pointerdown", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      cleanupListeners();
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Play error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const formatTime = (timeInSec: number) => {
    if (!timeInSec || isNaN(timeInSec)) return "00:00";
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hidden Native Audio Element (Continuous Loop) */}
      <audio
        ref={audioRef}
        src="/audio/annoor.mp4"
        preload="auto"
        loop={true}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          // Endless loop whenever it reaches the end
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }}
        onError={(e) => {
          console.warn("Audio load error:", e);
        }}
      >
        <source src="/audio/annoor.mp4" type="audio/mp4" />
        <source src="/audio/annoor.m4a" type="audio/mp4" />
      </audio>

      {/* Floating Container (Bottom-Left) with Outside-Click ref */}
      <div
        ref={containerRef}
        className="fixed bottom-6 left-5 sm:left-6 z-[9995] select-none font-bengali print:hidden"
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            /* ================= EXPANDED FULL PLAYER ================= */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-72 sm:w-80 rounded-3xl border border-emerald-500/30 bg-slate-950/95 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                    style={{ animationDuration: "8s" }}
                  >
                    <Music2 className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t("আননূর ইসলামিক নাশিদ", "Annoor Islamic Nasheed")}</span>
                      <Sparkles className="h-3 w-3 text-amber-300" />
                    </h4>
                    <p className="text-[11px] text-emerald-300/80">
                      {isPlaying
                        ? t("সার্বক্ষণিক বাজছে...", "Playing in background...")
                        : t("বিরতি রয়েছে", "Paused")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Minimize player"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="mt-3.5 space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls Row */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                {/* Loop Button (Always Active) */}
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`rounded-xl p-2 transition-all ${
                    isLooping
                      ? "text-emerald-400 bg-emerald-500/15"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={isLooping ? t("সার্বক্ষণিক লুপ চালু", "Continuous Loop On") : t("লুপ বন্ধ", "Loop Off")}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Main Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#20ba59] via-[#25D366] to-[#2ee272] text-white shadow-[0_8px_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-white text-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                  )}
                </button>

                {/* Volume / Mute Toggle with Percentage */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVolume(val);
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400"
                  />
                  <span className="text-[10px] font-mono text-emerald-300 w-7 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================= COMPACT MINIMALIST PILL ================= */
            <motion.div
              key="compact"
              onClick={() => setIsExpanded(true)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-950/90 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl ring-1 ring-white/10 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 transition-all active:scale-98"
            >
              {/* Play/Pause round button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {/* Ping wave when playing */}
                {isPlaying && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping opacity-75" />
                )}

                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-white text-white relative z-10" />
                ) : (
                  <Play className="h-4 w-4 fill-white text-white ml-0.5 relative z-10" />
                )}
              </button>

              {/* Title & Equalizer Clickable Info */}
              <div className="pr-1 flex items-center gap-2.5">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {t("আননূর নাশিদ", "Annoor Nasheed")}
                    </span>
                    {isPlaying && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-300/80 font-mono">
                    {isPlaying
                      ? `${formatTime(currentTime)} • ${Math.round((isMuted ? 0 : volume) * 100)}%`
                      : t("ট্যাপ করে শুনুন", "Tap to play")}
                  </p>
                </div>

                {/* Animated Sound Wave Bars when playing */}
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-3.5 px-1">
                    <span className="w-0.5 rounded-full bg-emerald-400 animate-[bounce_0.8s_infinite]" style={{ height: "60%" }} />
                    <span className="w-0.5 rounded-full bg-teal-300 animate-[bounce_1.1s_infinite_0.2s]" style={{ height: "100%" }} />
                    <span className="w-0.5 rounded-full bg-emerald-400 animate-[bounce_0.9s_infinite_0.4s]" style={{ height: "40%" }} />
                    <span className="w-0.5 rounded-full bg-teal-200 animate-[bounce_1.2s_infinite_0.1s]" style={{ height: "80%" }} />
                  </div>
                ) : (
                  <Music2 className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                )}

                {/* Expand Chevron */}
                <span className="rounded-full p-1 text-slate-400 hover:text-white transition-colors">
                  <ChevronUp className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NasheedPlayer;
