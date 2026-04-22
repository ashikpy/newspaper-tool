"use client";

import { useState, useMemo, useEffect } from "react";
import { UserButton, Show, SignInButton, useAuth } from "@clerk/nextjs";
import {
  getTrackedDays,
  toggleTrackedDay,
  bulkTrackDays,
  getVendorConfigs,
} from "./actions";
import { toBlob } from "html-to-image";
import { IoCopySharp, IoCheckmarkSharp } from "react-icons/io5";

// Helper to get calendar days
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function PaymentReceiptQR({ upiUri }: { upiUri: string }) {
  const [qrLoaded, setQrLoaded] = useState(false);

  // Reset loading state when URI changes
  useEffect(() => {
    setQrLoaded(false);
  }, [upiUri]);

  return (
    <div
      className={`relative w-[120px] h-[120px] border-2 border-[#111] bg-white flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_#111] ${!qrLoaded ? "animate-shimmer" : ""}`}
    >
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUri)}`}
        alt="Payment QR"
        key={upiUri} // Force re-render/re-load on URI change
        className={`w-[100px] h-[100px] transition-opacity duration-500 ${qrLoaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        onLoad={() => setQrLoaded(true)}
      />
    </div>
  );
}

export default function TrackerPage() {
  const { isSignedIn } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dbTracks, setDbTracks] = useState<
    { id: string; date: string; vendorName: string }[]
  >([]);
  const [lastClickedDate, setLastClickedDate] = useState<Date | null>(null);
  const [vendorConfigs, setVendorConfigs] = useState<
    { vendorName: string; upiVpa: string | null }[]
  >([]);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyReceipt = async () => {
    const el = document.getElementById("screenshot-target");
    if (!el) return;

    try {
      setIsCopying(true);
      const blob = await toBlob(el, {
        backgroundColor: "#faf8f5",
        pixelRatio: 2,
        skipFonts: true, // Bypass the 'normalizeFontFamily' bug
        style: {
          // Force apply fonts in case skipping font embedding loses them
          fontFamily: "var(--font-body)",
        },
      });

      if (blob) {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy receipt:", err);
    } finally {
      setIsCopying(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const vendors = [
    {
      name: "The Hindu",
      color: "bg-neo-yellow",
      normalPrice: 7,
      sundayPrice: 10,
    },
    {
      name: "Times of India",
      color: "bg-white",
      normalPrice: 6,
      sundayPrice: 8,
    },
    {
      name: "The New Indian Express",
      color: "bg-neo-blue",
      normalPrice: 5,
      sundayPrice: 7,
    },
    {
      name: "Daily Thanthi",
      color: "bg-neo-red",
      normalPrice: 5,
      sundayPrice: 6,
    },
    {
      name: "Dinamalar",
      color: "bg-neo-yellow",
      normalPrice: 6,
      sundayPrice: 8,
    },
    { name: "Dinakaran", color: "bg-white", normalPrice: 5, sundayPrice: 7 },
  ];

  const [selectedVendorIdx, setSelectedVendorIdx] = useState(0);
  const activeVendor = vendors[selectedVendorIdx];

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Array of blank slots before the 1st of the month
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getDayKey = (d: Date) =>
    `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;

  const getLocalDayKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  useEffect(() => {
    if (isSignedIn) {
      getTrackedDays(year, month).then(setDbTracks);
      getVendorConfigs().then((configs) => setVendorConfigs(configs as any));
    }
  }, [year, month, isSignedIn]);

  // Derived state mapping tracked days for the CURRENT active vendor
  const trackedDays = useMemo(() => {
    const map: Record<string, boolean> = {};
    dbTracks.forEach((t) => {
      if (t.vendorName === activeVendor.name) {
        const d = new Date(t.date);
        // Use UTC getters because we store as midday UTC
        const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
        map[key] = true;
      }
    });
    return map;
  }, [dbTracks, activeVendor]);

  const toggleDay = async (d: Date, shiftKey: boolean = false) => {
    // Current date 'd' is a local date from the calendar day.
    // Convert it to midday UTC for consistent keying and storage.
    const toMiddayUtc = (date: Date) =>
      new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
      );

    const targetUtc = toMiddayUtc(d);
    const targetKey = getDayKey(targetUtc);
    const currentlyTracked = !!trackedDays[targetKey];

    if (shiftKey && lastClickedDate) {
      // Range selection
      const startLocal = lastClickedDate < d ? lastClickedDate : d;
      const endLocal = lastClickedDate < d ? d : lastClickedDate;

      const rangeDatesUtc: Date[] = [];
      const tempLocal = new Date(startLocal);
      while (tempLocal <= endLocal) {
        rangeDatesUtc.push(toMiddayUtc(tempLocal));
        tempLocal.setDate(tempLocal.getDate() + 1);
      }

      const dateIsos = rangeDatesUtc.map((rd) => rd.toISOString());
      const shouldTrack = !currentlyTracked;

      // Optimistic bulk update
      setDbTracks((prev) => {
        let filtered = prev;
        if (!shouldTrack) {
          filtered = prev.filter((t) => {
            const td = new Date(t.date);
            const tdKey = getDayKey(td);
            return !rangeDatesUtc.some(
              (rd) =>
                getDayKey(rd) === tdKey && t.vendorName === activeVendor.name,
            );
          });
        }

        if (shouldTrack) {
          const newItems = rangeDatesUtc
            .filter((rd) => !trackedDays[getDayKey(rd)])
            .map((rd) => ({
              id: "temp-" + rd.getTime(),
              date: rd.toISOString(),
              vendorName: activeVendor.name,
            }));
          return [...filtered, ...newItems];
        }
        return filtered;
      });

      try {
        await bulkTrackDays(dateIsos, activeVendor.name, shouldTrack);
      } catch (e) {
        getTrackedDays(year, month).then(setDbTracks);
      }
    } else {
      // Single toggle
      const iso = targetUtc.toISOString();
      setDbTracks((prev) => {
        if (currentlyTracked) {
          return prev.filter((t) => {
            const td = new Date(t.date);
            return !(
              getDayKey(td) === targetKey && t.vendorName === activeVendor.name
            );
          });
        } else {
          return [
            ...prev,
            {
              id: "temp-" + Date.now(),
              date: iso,
              vendorName: activeVendor.name,
            },
          ];
        }
      });

      try {
        await toggleTrackedDay(iso, activeVendor.name);
      } catch (e) {
        getTrackedDays(year, month).then(setDbTracks);
      }
    }

    setLastClickedDate(d);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calculate stats for current month
  const currentMonthStats = useMemo(() => {
    let normalDaysTracked = 0;
    let sundaysTracked = 0;

    daysInMonth.forEach((date) => {
      // Use getLocalDayKey for objects in daysInMonth (which are local)
      // Actually we should just convert daysInMonth objects to the UTC key for comparison
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
      );
      if (trackedDays[getDayKey(utcDate)]) {
        if (date.getDay() === 0) sundaysTracked++;
        else normalDaysTracked++;
      }
    });

    const totalCost =
      normalDaysTracked * activeVendor.normalPrice +
      sundaysTracked * activeVendor.sundayPrice;

    const activeConfig = vendorConfigs.find(
      (c) => c.vendorName === activeVendor.name,
    );
    const upiUri = activeConfig?.upiVpa
      ? `upi://pay?pa=${activeConfig.upiVpa}&pn=${encodeURIComponent(activeVendor.name)}&am=${totalCost}&cu=INR`
      : null;

    return { normalDaysTracked, sundaysTracked, totalCost, upiUri };
  }, [trackedDays, daysInMonth, activeVendor, vendorConfigs]);

  return (
    <div className="min-h-screen bg-newspaper-base p-4 md:p-8 text-[#111] font-body">
      <main className="max-w-6xl mx-auto border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_#111] flex flex-col min-h-[85vh]">
        {/* Header */}
        <header className="border-b-4 border-[#111] p-6 bg-neo-yellow flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-black font-display">
            Newspaper Tracker
          </h1>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Newspaper Select in Navbar */}
            <div className="relative w-fit">
              <select
                className="appearance-none border-2 border-[#111] bg-white pl-3 pr-8 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#111] focus:outline-none cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all w-full"
                value={selectedVendorIdx}
                onChange={(e) => setSelectedVendorIdx(Number(e.target.value))}
              >
                {vendors.map((v, i) => (
                  <option key={i} value={i}>
                    {v.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <span className="font-black text-xs">↓</span>
              </div>
            </div>

            <a
              href="/profile"
              className="border-2 border-[#111] bg-white px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Set VPA
            </a>
            <a
              href="/"
              className="border-2 border-[#111] bg-white px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              ← Back
            </a>
            <Show when="signed-in">
              <div className="border-2 border-[#111] bg-white h-[42px] px-2 flex items-center justify-center shadow-[4px_4px_0px_0px_#111]">
                <UserButton />
              </div>
            </Show>
          </div>
        </header>

        <Show when="signed-in">
          <div className="flex flex-col lg:flex-row flex-1 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[#111]">
            {/* Sidebar Section */}
            <section className="lg:w-1/3 flex flex-col bg-newspaper-base border-b-4 lg:border-b-0 border-[#111]">
              <div className="p-6 border-b-4 border-[#111] bg-white">
                <h2 className="text-2xl font-black ">Vendor & Billing</h2>
                <p className="text-sm font-bold text-gray-600 mt-1">
                  Select your paper and track costs.
                </p>
                <button
                  onClick={handleCopyReceipt}
                  disabled={isCopying}
                  className={`mt-4 w-full flex items-center justify-center gap-2 border-2 border-[#111] py-2 font-black uppercase text-xs transition-all shadow-[4px_4px_0px_0px_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${copySuccess ? "bg-neo-blue" : "bg-white hover:bg-neo-yellow"}`}
                >
                  {copySuccess ? (
                    <>
                      <IoCheckmarkSharp className="text-sm" /> Copied!
                    </>
                  ) : (
                    <>
                      <IoCopySharp className="text-sm" />
                      {isCopying ? "Snapping..." : "Snap & Copy Receipt"}
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 flex flex-col gap-8 " id="screenshot-target">
                {/* Redundant select removed from here */}
                {/* Receipt Billboard - New & Improved */}
                <div className="relative mt-6 mb-8 mx-auto w-[90%] rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  {/* Top serrated edge */}
                  <div
                    className="h-2 w-full bg-[#fcfaf2]"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(-45deg, transparent 4px, #000 0), linear-gradient(45deg, transparent 4px, #000 0)",
                      WebkitMaskSize: "8px 8px",
                      WebkitMaskRepeat: "repeat-x",
                      maskImage:
                        "linear-gradient(-45deg, transparent 4px, #000 0), linear-gradient(45deg, transparent 4px, #000 0)",
                      maskSize: "8px 8px",
                      maskRepeat: "repeat-x",
                    }}
                  ></div>

                  {/* Receipt Body */}
                  <div className="bg-[#fcfaf2] p-6 pt-4 font-mono text-[11px] leading-tight text-[#333] border-x-2 border-[#ddd]">
                    <div className="text-center mb-6">
                      <div className="font-black text-base tracking-tighter uppercase mb-1">
                        ** NEWS CLIP **
                      </div>
                      <div className="text-[9px] uppercase opacity-70">
                        Daily Newspaper Service
                        <br />
                        EST. {new Date().getFullYear()}
                      </div>
                    </div>

                    <div className="border-y border-dashed border-[#888] py-3 my-4 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>DESCRIPTION</span>
                        <span>QTY x RATE</span>
                      </div>
                      <div className="flex justify-between pt-1 gap-2">
                        <span className="truncate">
                          {activeVendor.name} (Reg)
                        </span>
                        <span className="whitespace-nowrap flex-shrink-0">
                          {currentMonthStats.normalDaysTracked} x ₹
                          {activeVendor.normalPrice}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="truncate">
                          {activeVendor.name} (Sun)
                        </span>
                        <span className="whitespace-nowrap shrink-0">
                          {currentMonthStats.sundaysTracked} x ₹
                          {activeVendor.sundayPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm font-black border-b-2 border-[#111] pb-1">
                      <span>TOTAL PAYABLE</span>
                      <span className="whitespace-nowrap">
                        ₹{currentMonthStats.totalCost}
                      </span>
                    </div>

                    {/* Fixed-height Payment Section to prevent layout shift */}
                    <div className="mt-6 border-t border-dashed border-[#ccc] pt-6 flex flex-col items-center justify-center min-h-[180px]">
                      {currentMonthStats.upiUri ? (
                        <div className="flex flex-col items-center gap-2">
                          <PaymentReceiptQR upiUri={currentMonthStats.upiUri} />
                          <span className="text-[10px] font-bold uppercase opacity-60 mt-1">
                            Scan to Pay UPI
                          </span>
                          <span className="text-[10px] font-bold uppercase text-neo-red truncate max-w-[150px]">
                            {
                              vendorConfigs.find(
                                (c) => c.vendorName === activeVendor.name,
                              )?.upiVpa
                            }
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <div className="w-[120px] h-[120px] border-2 border-dashed border-[#ccc] animate-shimmer" />
                          <span className="text-[10px] font-bold uppercase">
                            Waiting for billing...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col items-center text-center">
                      <div className="text-[10px] italic opacity-70">
                        {new Date().toLocaleString("en-IN", {
                          dateStyle: "full",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom serrated edge */}
                  <div
                    className="h-2 w-full bg-[#fcfaf2]"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(-45deg, transparent 4px, #000 0), linear-gradient(45deg, transparent 4px, #000 0)",
                      WebkitMaskSize: "8px 8px",
                      WebkitMaskRepeat: "repeat-x",
                      WebkitMaskPosition: "bottom",
                      maskImage:
                        "linear-gradient(-45deg, transparent 4px, #000 0), linear-gradient(45deg, transparent 4px, #000 0)",
                      maskSize: "8px 8px",
                      maskRepeat: "repeat-x",
                      maskPosition: "bottom",
                      transform: "rotate(180deg)",
                    }}
                  ></div>
                </div>
              </div>
            </section>
            {/* Calendar Section */}
            <section className="lg:w-2/3 flex flex-col bg-white">
              <div className="p-6 border-b-4 border-[#111] flex justify-between items-center bg-neo-blue flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevMonth}
                    className="border-2 border-[#111] bg-white px-3 py-1 font-black shadow-[2px_2px_0px_0px_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                  >
                    ←
                  </button>
                  <h2 className="text-2xl md:text-3xl font-black uppercase w-48 text-center">
                    {monthName} {year}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="border-2 border-[#111] bg-white px-3 py-1 font-black shadow-[2px_2px_0px_0px_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className={`text-center font-black uppercase text-sm md:text-base pb-2 border-b-2 border-[#111] ${day === "Sun" ? "text-neo-red" : ""}`}
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2 md:gap-4 flex-1">
                  {/* Empty slots for days before the 1st */}
                  {blanks.map((blank) => (
                    <div
                      key={`blank-${blank}`}
                      className="p-2 border-2 border-transparent"
                    ></div>
                  ))}
                  {/* Active calendar days */}
                  {daysInMonth.map((date) => {
                    const dayNum = date.getDate();
                    const nowIndia = new Date(
                      new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                      }),
                    );
                    const isToday =
                      dayNum === nowIndia.getDate() &&
                      date.getMonth() === nowIndia.getMonth() &&
                      date.getFullYear() === nowIndia.getFullYear();

                    const dUtc = new Date(
                      Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        12,
                      ),
                    );
                    const isTracked = trackedDays[getDayKey(dUtc)];
                    const isSunday = date.getDay() === 0;
                    return (
                      <button
                        key={dayNum}
                        onClick={(e) => toggleDay(date, e.shiftKey)}
                        className={`
                        aspect-square border-2 border-[#111] flex flex-col items-center justify-center relative transition-all active:translate-x-[2px] active:translate-y-[2px]
                        ${isToday ? "border-4 font-black shadow-[inner_0_0_10px_rgba(0,0,0,0.1)]" : "font-bold"}
                        ${isTracked ? "bg-neo-red text-[#111] shadow-none translate-x-[2px] translate-y-[2px]" : `shadow-[4px_4px_0px_0px_#111] hover:bg-neo-yellow bg-white ${isSunday ? "text-neo-red" : ""}`}
                      `}
                      >
                        <span className="text-xl md:text-2xl">{dayNum}</span>
                        {isTracked && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white border border-[#111]"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </Show>

        <Show when="signed-out">
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-neo-yellow">
            <h2 className="text-3xl font-black uppercase mb-4">
              Tracking Requires Subscription!
            </h2>
            <p className="font-bold mb-6">
              Sign in to start tracking your daily reading limits.
            </p>
            <SignInButton mode="modal">
              <button className="border-4 border-[#111] bg-white hover:bg-[#111] hover:text-white py-3 px-8 font-black uppercase text-xl shadow-[4px_4px_0px_0px_#111] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                Sign In Now
              </button>
            </SignInButton>
          </div>
        </Show>
      </main>
    </div>
  );
}
