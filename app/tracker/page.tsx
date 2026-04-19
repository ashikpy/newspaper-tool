"use client";

import { useState, useMemo, useEffect } from "react";
import { UserButton, Show, SignInButton, useAuth } from "@clerk/nextjs";
import { getTrackedDays, toggleTrackedDay } from "./actions";

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

export default function TrackerPage() {
  const { isSignedIn } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dbTracks, setDbTracks] = useState<{ id: string; date: string; vendorName: string }[]>([]);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const vendors = [
    { name: "The Hindu", color: "bg-neo-yellow", normalPrice: 7, sundayPrice: 10 },
    { name: "Times of India", color: "bg-white", normalPrice: 6, sundayPrice: 8 },
    { name: "The New Indian Express", color: "bg-neo-blue", normalPrice: 5, sundayPrice: 7 },
    { name: "Daily Thanthi", color: "bg-neo-red", normalPrice: 5, sundayPrice: 6 },
    { name: "Dinamalar", color: "bg-neo-yellow", normalPrice: 6, sundayPrice: 8 },
    { name: "Dinakaran", color: "bg-white", normalPrice: 5, sundayPrice: 7 },
  ];

  const [selectedVendorIdx, setSelectedVendorIdx] = useState(0);
  const activeVendor = vendors[selectedVendorIdx];

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Array of blank slots before the 1st of the month
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getDayKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  useEffect(() => {
    if (isSignedIn) {
      getTrackedDays(year, month).then(setDbTracks);
    }
  }, [year, month, isSignedIn]);

  // Derived state mapping tracked days for the CURRENT active vendor
  const trackedDays = useMemo(() => {
    const map: Record<string, boolean> = {};
    dbTracks.forEach(t => {
      if (t.vendorName === activeVendor.name) {
        const d = new Date(t.date);
        map[getDayKey(d)] = true;
      }
    });
    return map;
  }, [dbTracks, activeVendor]);

  const toggleDay = async (d: Date) => {
    const key = getDayKey(d);
    const currentlyTracked = trackedDays[key];
    const dateIso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toISOString();

    // Optimistic UI update
    setDbTracks((prev) => {
      if (currentlyTracked) {
        return prev.filter(t => {
          const td = new Date(t.date);
          return !(td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth() && td.getDate() === d.getDate() && t.vendorName === activeVendor.name);
        });
      } else {
        return [...prev, { id: 'temp-' + Date.now(), date: dateIso, vendorName: activeVendor.name }];
      }
    });

    try {
       await toggleTrackedDay(dateIso, activeVendor.name);
    } catch(e) {
       // revert on failure by simply reloading
       getTrackedDays(year, month).then(setDbTracks);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calculate stats for current month
  const currentMonthStats = useMemo(() => {
    let normalDaysTracked = 0;
    let sundaysTracked = 0;

    daysInMonth.forEach((date) => {
      if (trackedDays[getDayKey(date)]) {
        if (date.getDay() === 0) sundaysTracked++;
        else normalDaysTracked++;
      }
    });

    const totalCost = normalDaysTracked * activeVendor.normalPrice + sundaysTracked * activeVendor.sundayPrice;

    return { normalDaysTracked, sundaysTracked, totalCost };
  }, [trackedDays, daysInMonth, activeVendor]);

  return (
    <div className="min-h-screen bg-newspaper-base p-4 md:p-8 text-[#111] font-body">
      <main className="max-w-6xl mx-auto border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_#111] flex flex-col min-h-[85vh]">
        {/* Header */}
        <header className="border-b-4 border-[#111] p-6 bg-neo-yellow flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-black font-display">
            Newspaper Tracker
          </h1>
          <div className="flex gap-4 items-center">
            <a
              href="/"
              className="border-2 border-[#111] bg-white px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              ← Back Home
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
            </div>
            <div className="p-6 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="font-bold uppercase text-sm">
                  Select Newspaper
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none border-4 border-[#111] bg-white p-3 font-bold uppercase shadow-[2px_2px_0px_0px_#11111120] focus:outline-none cursor-pointer"
                    value={selectedVendorIdx}
                    onChange={(e) =>
                      setSelectedVendorIdx(Number(e.target.value))
                    }
                  >
                    {vendors.map((v, i) => (
                      <option key={i} value={i}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l-4 border-[#111]">
                    <span className="font-black">↓</span>
                  </div>
                </div>
              </div>
              <div
                className={`border-4 border-[#111] ${activeVendor.color} p-6 shadow-[2px_2px_0px_0px_#11111120] flex flex-col gap-4 text-center mt-4`}
              >
                <h3 className="font-black uppercase text-xl border-b-2 border-[#111] pb-2">
                  Estimated Pay
                </h3>
                <div className="flex justify-between font-bold text-sm bg-white border-2 border-[#111] p-2">
                  <span>Regular (₹{activeVendor.normalPrice})</span>
                  <span>x {currentMonthStats.normalDaysTracked}</span>
                </div>
                <div className="flex justify-between font-bold text-sm bg-white border-2 border-[#111] p-2">
                  <span>Sunday (₹{activeVendor.sundayPrice})</span>
                  <span>x {currentMonthStats.sundaysTracked}</span>
                </div>
                <div className="border-t-4 border-[#111] mt-2 pt-4">
                  <div className="text-3xl font-black">
                    ₹{currentMonthStats.totalCost}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider mt-1">
                    Total {monthName}
                  </div>
                </div>
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
                  const isToday =
                    dayNum === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear();
                  const isTracked = trackedDays[getDayKey(date)];
                  const isSunday = date.getDay() === 0;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => toggleDay(date)}
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
            <h2 className="text-3xl font-black uppercase mb-4">Tracking Requires Subscription!</h2>
            <p className="font-bold mb-6">Sign in to start tracking your daily reading limits.</p>
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
