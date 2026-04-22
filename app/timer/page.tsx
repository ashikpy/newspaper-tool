"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  IoPlaySharp,
  IoPauseSharp,
  IoStopSharp,
  IoMoonSharp,
  IoSunnySharp,
  IoArrowBackSharp,
  IoVolumeHighSharp,
  IoVolumeMuteSharp,
  IoTimerSharp,
  IoRefreshSharp,
} from "react-icons/io5";

const PRESETS = [
  { label: "5m", minutes: 5, color: "bg-neo-blue" },
  { label: "15m", minutes: 15, color: "bg-neo-yellow" },
  { label: "25m", minutes: 25, color: "bg-neo-red" },
  { label: "45m", minutes: 45, color: "bg-neo-blue" },
  { label: "60m", minutes: 60, color: "bg-neo-yellow" },
];

export default function TimerPage() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [completedSessions, setCompletedSessions] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setAlarmActive(true);
      setCompletedSessions((c) => c + 1);
      playAlarm();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const startTimer = useCallback(() => {
    if (seconds === 0 && !isActive) {
      const total = inputMinutes * 60;
      setTotalSeconds(total);
      setSeconds(total);
    }
    setIsActive(true);
    setAlarmActive(false);
    dismissAlarm();
  }, [seconds, isActive, inputMinutes]);

  const pauseTimer = () => {
    setIsActive(false);
  };

  const stopTimer = () => {
    setIsActive(false);
    setSeconds(0);
    setAlarmActive(false);
    dismissAlarm();
  };

  const selectPreset = (minutes: number) => {
    stopTimer();
    setInputMinutes(minutes);
    const total = minutes * 60;
    setTotalSeconds(total);
    setSeconds(0);
  };

  const playAlarm = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
        );
        audioRef.current.loop = true;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      /* silent fail */
    }
  };

  const dismissAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const displaySeconds = seconds > 0 || isActive ? seconds : inputMinutes * 60;
  const progress =
    totalSeconds > 0 ? ((totalSeconds - displaySeconds) / totalSeconds) * 100 : 0;

  // Theme classes
  const bg = isDark ? "bg-[#0a0a0a]" : "bg-newspaper-base";
  const text = isDark ? "text-[#e8e4df]" : "text-[#111]";
  const border = isDark ? "border-[#333]" : "border-[#111]";
  const borderColor = isDark ? "#333" : "#111";
  const cardBg = isDark ? "bg-[#161616]" : "bg-white";
  const mutedText = isDark ? "text-[#666]" : "text-gray-400";
  const shadowColor = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,1)";

  return (
    <div
      className={`${bg} ${text} min-h-screen transition-colors duration-500 font-body`}
    >
      {/* Progress bar across the top */}
      <div className={`fixed top-0 left-0 w-full h-1.5 ${isDark ? "bg-[#222]" : "bg-gray-200"} z-50`}>
        <div
          className="h-full bg-neo-red transition-all duration-1000 ease-linear"
          style={{ width: `${isActive || seconds > 0 ? progress : 0}%` }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-16 flex flex-col min-h-screen">
        {/* ── Navigation ── */}
        <nav
          className={`flex justify-between items-center pb-6 mb-8 border-b-4 ${border}`}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`border-2 ${border} px-4 py-2 font-black uppercase text-xs flex items-center gap-2 shadow-[4px_4px_0px_0px_${shadowColor}] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${cardBg}`}
            >
              <IoArrowBackSharp /> Back
            </Link>
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tighter hidden md:block">
              Focus Timer
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Session counter */}
            <div
              className={`border-2 ${border} px-3 py-2 font-mono text-xs font-black flex items-center gap-2 ${cardBg}`}
            >
              <IoTimerSharp className="text-neo-red" />
              <span>{completedSessions}</span>
            </div>
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`border-2 ${border} p-2.5 ${cardBg} shadow-[4px_4px_0px_0px_${shadowColor}] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
            >
              {isDark ? (
                <IoSunnySharp className="text-neo-yellow" />
              ) : (
                <IoMoonSharp />
              )}
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12">
          {/* Timer Card */}
          <div className="w-full max-w-2xl">
            <div
              className={`relative border-4 ${border} ${cardBg} p-8 md:p-12 ${alarmActive ? "animate-pulse" : ""}`}
              style={{
                boxShadow: `12px 12px 0px 0px ${borderColor}`,
              }}
            >
              {/* Top label */}
              <div
                className={`absolute -top-4 left-8 ${isDark ? "bg-[#e8e4df] text-[#111]" : "bg-[#111] text-white"} px-4 py-1 font-mono text-[10px] font-black uppercase tracking-widest`}
              >
                Focus.Session.v1
              </div>

              {/* Edition time */}
              <div className={`absolute -top-4 right-8 ${isDark ? "bg-neo-yellow text-[#111]" : "bg-neo-yellow text-[#111]"} px-4 py-1 font-mono text-[10px] font-black uppercase tracking-widest`}>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}
              </div>

              {/* Decorative corner marks */}
              <div className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${border} opacity-30`} />
              <div className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${border} opacity-30`} />
              <div className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${border} opacity-30`} />
              <div className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${border} opacity-30`} />

              {/* Time Display */}
              <div className="flex flex-col items-center py-8 md:py-12">
                <h1
                  className="text-[5rem] md:text-[10rem] lg:text-[12rem] font-black font-mono leading-none tracking-tighter select-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatTime(displaySeconds)}
                </h1>

                {/* Status line */}
                <div className={`mt-4 flex items-center gap-3 font-mono text-xs font-bold uppercase ${mutedText}`}>
                  {isActive && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-neo-red rounded-full animate-pulse" />
                      Running
                    </span>
                  )}
                  {!isActive && seconds > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 bg-neo-yellow rounded-full`} />
                      Paused
                    </span>
                  )}
                  {!isActive && seconds === 0 && !alarmActive && (
                    <span>Ready • {inputMinutes} min</span>
                  )}
                  {alarmActive && (
                    <button
                      onClick={() => {
                        setAlarmActive(false);
                        dismissAlarm();
                      }}
                      className="flex items-center gap-2 text-neo-red animate-bounce cursor-pointer"
                    >
                      <IoVolumeHighSharp className="text-lg" />
                      <span>Time&apos;s up! Click to dismiss</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar inside card */}
              <div className={`w-full h-3 border-2 ${border} overflow-hidden`}>
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    alarmActive
                      ? "bg-neo-red"
                      : isActive
                        ? "bg-neo-yellow"
                        : "bg-neo-blue"
                  }`}
                  style={{
                    width: `${isActive || seconds > 0 ? progress : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Presets Row ── */}
          <div className="w-full max-w-2xl">
            <div className={`font-mono text-[10px] font-black uppercase ${mutedText} mb-3 tracking-widest`}>
              Quick Presets
            </div>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => selectPreset(preset.minutes)}
                  disabled={isActive}
                  className={`border-2 ${border} px-5 py-2.5 font-black uppercase text-sm transition-all shadow-[4px_4px_0px_0px_${shadowColor}] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed ${
                    inputMinutes === preset.minutes && !isActive
                      ? `${preset.color} text-[#111]`
                      : `${cardBg}`
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              {/* Custom input */}
              <div
                className={`border-2 ${border} flex items-center overflow-hidden ${cardBg} shadow-[4px_4px_0px_0px_${shadowColor}]`}
              >
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={inputMinutes}
                  disabled={isActive}
                  onChange={(e) =>
                    setInputMinutes(
                      Math.max(1, Math.min(180, parseInt(e.target.value) || 1)),
                    )
                  }
                  className="w-16 bg-transparent text-center font-black text-sm py-2.5 focus:outline-none disabled:opacity-30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span
                  className={`font-mono text-[10px] uppercase font-black pr-3 ${mutedText}`}
                >
                  min
                </span>
              </div>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="w-full max-w-2xl flex gap-4">
            {!isActive ? (
              <button
                onClick={startTimer}
                className={`flex-1 border-4 ${border} py-5 font-black uppercase text-xl flex items-center justify-center gap-3 bg-neo-yellow text-[#111] transition-all active:translate-x-1 active:translate-y-1`}
                style={{ boxShadow: `8px 8px 0px 0px ${borderColor}` }}
              >
                <IoPlaySharp className="text-2xl" />
                {seconds > 0 ? "Resume" : "Start"}
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className={`flex-1 border-4 ${border} py-5 font-black uppercase text-xl flex items-center justify-center gap-3 bg-neo-blue text-[#111] transition-all active:translate-x-1 active:translate-y-1`}
                style={{ boxShadow: `8px 8px 0px 0px ${borderColor}` }}
              >
                <IoPauseSharp className="text-2xl" />
                Pause
              </button>
            )}

            <button
              onClick={stopTimer}
              className={`border-4 ${border} px-6 py-5 bg-neo-red text-[#111] transition-all active:translate-x-1 active:translate-y-1`}
              style={{ boxShadow: `8px 8px 0px 0px ${borderColor}` }}
            >
              <IoStopSharp className="text-2xl" />
            </button>

            <button
              onClick={() => {
                stopTimer();
                setInputMinutes(25);
                setTotalSeconds(25 * 60);
                setCompletedSessions(0);
              }}
              className={`border-4 ${border} px-6 py-5 ${cardBg} transition-all active:translate-x-1 active:translate-y-1`}
              style={{ boxShadow: `8px 8px 0px 0px ${borderColor}` }}
            >
              <IoRefreshSharp className="text-2xl" />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className={`mt-16 pt-8 border-t-4 ${border}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`font-mono text-[10px] font-black uppercase tracking-widest ${mutedText}`}>
              © {new Date().getFullYear()} Brutalist Toolkit • Focus Module
            </div>
            <div className={`flex gap-6 font-mono text-[10px] font-black uppercase tracking-widest ${mutedText}`}>
              <span>Sessions: {completedSessions}</span>
              <span className={`w-1 h-1 ${isDark ? "bg-[#444]" : "bg-gray-300"} rotate-45 self-center`} />
              <span>
                Total:{" "}
                {formatTime(completedSessions * inputMinutes * 60)}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
