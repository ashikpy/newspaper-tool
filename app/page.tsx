import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { IoCompassSharp, IoFlash, IoLibrary, IoStar } from "react-icons/io5";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="min-h-screen bg-newspaper-base p-4 md:p-8 text-[#111]">
      <main className="max-w-7xl mx-auto border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_#111] flex flex-col">
        {/* Header / Masthead */}
        <header className="border-b-4 border-[#111] p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center bg-neo-yellow gap-4 relative overflow-hidden">
          {/* base bg */}

          <div className="absolute inset-0 bg-neo-yellow" />
          {/* right-side pattern with fade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/header-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundSize: "10px 10px",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 80%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 50%, black 100%)",
              opacity: 0.8,
            }}
          />
          {/* top running marquee */}
          <div className="absolute top-0 left-0 w-full bg-[#111] text-white py-1 overflow-hidden z-20 border-b-2 border-[#111]">
            <div className="flex whitespace-nowrap animate-marquee font-mono text-[10px] uppercase font-black tracking-widest leading-none items-center">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-4 flex items-center gap-2">
                  <IoFlash className="text-neo-yellow" />
                  Breaking: New Brutalism is here
                  <IoStar className="text-neo-blue" />
                  Limited Edition Archive Access Available
                  <IoLibrary className="text-neo-red" />
                  Stay Bold •
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col z-10 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-2">
              The Brutalist Daily
            </h1>

            <p className="font-bold text-lg md:text-xl uppercase border-y-2 border-[#111] py-1 inline-block text-gray-800 w-max">
              Volume I • Issue 1 • Pastel Edition
            </p>
          </div>
          <div className="flex md:flex-col gap-2 z-10 shrink-0">
            <Show when="signed-in">
              <div className="flex gap-2">
                <a
                  href="/tracker"
                  className="border-2 border-[#111] bg-white hover:bg-neo-blue py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none block flex-1"
                >
                  Money <br />
                  Tracker
                </a>
                <a
                  href="/timer"
                  className="border-2 border-[#111] bg-white hover:bg-neo-yellow py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none block flex-1"
                >
                  <span className="hidden md:inline">Focus</span> Timer
                </a>
              </div>

              <div className="flex justify-center border-2 border-[#111] bg-white py-2 px-3 shadow-[4px_4px_0px_0px_#111] items-center gap-2">
                <UserButton />
                <p className="text-sm text-center font-bold uppercase">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="border-2 border-[#111] bg-white hover:bg-neo-blue py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none block w-full">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="border-2 border-[#111] bg-[#111] text-white hover:bg-white hover:text-[#111] py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none block w-full mt-2">
                  Subscribe (Sign Up)
                </button>
              </SignUpButton>
            </Show>

            <div className="border-2 border-[#111] bg-neo-blue py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x-4 divide-[#111] flex-1">
          {/* Main Story (Left) */}
          <section className="col-span-1 md:col-span-8 p-6 lg:p-8 flex flex-col">
            <div className="mb-6 pb-6 border-b-4 border-[#111]">
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-4 tracking-tight">
                Web Design Strips{" "}
                <span className="bg-neo-red text-[#111] px-2 py-1 transform -rotate-2 inline-block shadow-[2px_2px_0px_0px_#111]">
                  Back
                </span>
              </h2>
              <p className="text-xl md:text-2xl font-body font-bold mb-6 text-gray-700">
                Loud neon is fading. Soft pastels, strong grids, and
                high-contrast forms define the new brutalist aesthetic.
              </p>

              <div className="border-4 border-[#111] p-2 bg-neo-blue shadow-[6px_6px_0px_0px_#111] mb-6 inline-block w-full">
                <div className="relative w-full h-[300px] md:h-[400px] border-2 border-[#111] overflow-hidden grayscale">
                  <Image
                    src="/brutalist_art.png"
                    alt="Brutalist Artwork"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="prose prose-lg font-body max-w-none text-[#111]">
                <p className="text-lg">
                  Minimalism meets brutalism, but with a touch of joy. Content
                  is elevated through raw structure and soft colors, rather than
                  distracting visual flair. The focus returns to readability,
                  strong grids, and unyielding borders. A return to the
                  fundamentals of the printed page applied to digital screens.
                </p>
              </div>
            </div>

            {/* Read More button */}
            <button className="self-start mt-auto border-4 border-[#111] bg-neo-yellow hover:bg-white py-3 px-8 font-black uppercase text-xl shadow-[6px_6px_0px_0px_#111] transition-transform active:translate-x-[6px] active:translate-y-[6px] active:shadow-none">
              Read Entire Story
            </button>
          </section>

          {/* Sidebar (Right) */}
          <aside className="col-span-1 md:col-span-4 bg-newspaper-base flex flex-col">
            {/* Sidebar Article 1 */}
            <article className="p-6 border-b-4 border-[#111]">
              <span className="block border-2 border-[#111] bg-white px-2 py-0.5 w-fit uppercase font-bold text-xs mb-3 shadow-[2px_2px_0px_0px_#111]">
                Editorial
              </span>
              <h3 className="text-2xl font-black uppercase mb-3 leading-snug">
                The Canvas Speaks
              </h3>
              <p className="font-body text-sm mb-4 text-gray-700">
                Introducing soft colors focuses the eye on structure playfully.
                The tinted space becomes a gentle primary element.
              </p>
              <div className="border-2 border-[#111] p-4 bg-neo-yellow shadow-[4px_4px_0px_0px_#111] transform rotate-1">
                <p className="font-body font-bold text-center italic text-sm">
                  "Less is more colorful." <br />- Architect
                </p>
              </div>
            </article>

            {/* Sidebar Article 2 / Ad block */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="border-4 border-[#111] bg-neo-red p-8 h-full flex flex-col items-center justify-center text-center shadow-[8px_8px_0px_0px_#111] group hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#111] transition-all cursor-pointer relative overflow-hidden bg-[url('/archive-pattern.svg')] bg-repeat bg-size-[200px_200px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-2 font-mono text-[10px] font-black uppercase opacity-20 rotate-90 origin-top-right pointer-events-none">
                  System.Archive.v1
                </div>

                <div className="mb-2 z-10">
                  <div className="w-16 h-16 border-4 border-[#111] bg-white rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111] mb-4 mx-auto group-hover:rotate-12 transition-transform">
                    <span className="text-4xl font-black">
                      <IoCompassSharp />
                    </span>
                  </div>
                </div>

                <h4 className="text-4xl font-black uppercase mb-3 leading-none tracking-tighter z-10">
                  Join The <br />
                  Archive
                </h4>

                <div className="font-mono text-[10px] font-black uppercase mb-6 bg-[#111] text-white px-2 py-1 inline-block z-10">
                  Verified Member access
                </div>

                <p className="font-body text-sm font-bold mb-8 text-[#111] leading-tight z-10">
                  Preserve the structure of information. Get exclusive insights
                  and premium layouts.
                </p>

                <div className="w-full border-t-2 border-[#111] mb-8 relative z-10">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-neo-red px-2">
                    <div className="w-3 h-3 border-2 border-[#111] rotate-45 bg-white"></div>
                  </div>
                </div>

                <button className="border-4 border-[#111] bg-white text-[#111] hover:bg-[#111] hover:text-white py-4 px-6 font-black uppercase transition-all w-full shadow-[6px_6px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-lg z-10">
                  Subscribe Now
                </button>

                <p className="mt-4 text-[10px] uppercase font-black opacity-60 z-10">
                  Cancel anytime • Non-refundable
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t-4 border-[#111] bg-[#111] text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y-4 md:divide-y-0 md:divide-x-4 divide-[#333]">
            {/* Column 1: Brand */}
            <div className="p-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter leading-none">
                The <br /> Brutalist <br /> Daily
              </h2>
              <p className="font-body text-xs font-bold text-gray-400 uppercase leading-relaxed">
                Documenting the raw structure of digital existence since 20XX.
                Form follows function, always.
              </p>
            </div>

            {/* Column 2: Nav */}
            <div className="p-8">
              <h4 className="font-mono text-xs font-black uppercase mb-6 text-neo-yellow underline underline-offset-4">
                Directory
              </h4>
              <ul className="space-y-2 font-black uppercase text-sm">
                <li>
                  <a
                    href="/"
                    className="hover:text-neo-blue transition-colors flex items-center gap-2"
                  >
                    <IoFlash className="text-xs" /> Archives
                  </a>
                </li>
                <li>
                  <a
                    href="/tracker"
                    className="hover:text-neo-yellow transition-colors flex items-center gap-2"
                  >
                    <IoCompassSharp className="text-xs" /> Tracker
                  </a>
                </li>
                <li>
                  <a
                    href="/profile"
                    className="hover:text-neo-red transition-colors flex items-center gap-2"
                  >
                    <IoLibrary className="text-xs" /> Settings
                  </a>
                </li>
              </ul>

              {/* The Stamp (Wavy Box Edition) */}
              <div className="mt-8">
                <button className="wavy-box bg-neo-red  transition-colors  cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#111] text-white p-1 rounded-full   transition-colors">
                      <IoFlash className="text-[10px]" />
                    </div>
                    <div className="text-left leading-none uppercase">
                      <div className="text-[9px] font-black tracking-tight text-[#111] ">
                        Join Archive
                      </div>
                      <div className="text-[7px] font-bold opacity-70 text-[#111] ">
                        $5/mo • Access
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Column 3: Stats */}
            <div className="p-8">
              <h4 className="font-mono text-xs font-black uppercase mb-6 text-neo-blue underline underline-offset-4">
                Transmission
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-black leading-none">99.9%</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Uptime Integrity
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">
                    {new Date().getFullYear()}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Current Era
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter/Note */}
            <div className="p-8 bg-zinc-900">
              <h4 className="font-mono text-xs font-black uppercase mb-6 text-neo-red underline underline-offset-4">
                Final Word
              </h4>
              <p className="font-body text-xs mb-6 text-gray-300 italic">
                "Structure is the only truth. Colors are just temporary
                distractions."
              </p>
              <div className="border-2 border-white p-2 text-center text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all cursor-crosshair">
                Return to Top
              </div>
            </div>
          </div>

          <div className="border-t-4 border-[#333] p-6 flex flex-col md:flex-row items-center justify-center">
            <p className="font-mono font-bold uppercase text-[10px] tracking-widest text-gray-500 flex items-center justify-center gap-4">
              <span>© {new Date().getFullYear()} BRUTALIST_TOOLKIT</span>
              <span className="w-1 h-1 bg-gray-500 rotate-45"></span>
              <span>EST. {new Date().getFullYear()}</span>
              <span className="w-1 h-1 bg-gray-500 rotate-45"></span>
              <span>ALL RIGHTS RESERVED</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
