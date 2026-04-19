import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-newspaper-base p-4 md:p-8 text-[#111]">
      <main className="max-w-7xl mx-auto border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_#111] flex flex-col">
        
        {/* Header / Masthead */}
        <header className="border-b-4 border-[#111] p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center bg-neo-yellow gap-4 relative overflow-hidden">
          <div className="flex flex-col z-10 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-2">
              The Brutalist Daily
            </h1>
            <p className="font-bold text-lg md:text-xl uppercase border-y-2 border-[#111] py-1 inline-block text-gray-800">
              Volume I • Issue 1 • Pastel Edition
            </p>
          </div>
          
          <div className="flex flex-col gap-2 z-10 shrink-0">
            <Show when="signed-in">
              <a href="/tracker" className="border-2 border-[#111] bg-white hover:bg-neo-blue py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none block">
                Go to Tracker
              </a>
              <div className="flex justify-center border-2 border-[#111] bg-white py-1 px-3 shadow-[4px_4px_0px_0px_#111]">
                <UserButton />
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
            <div className="border-2 border-[#111] bg-neo-blue py-1 px-3 font-bold uppercase shadow-[4px_4px_0px_0px_#111] text-sm text-center mt-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x-4 divide-[#111] flex-1">
          
          {/* Main Story (Left) */}
          <section className="col-span-1 md:col-span-8 p-6 lg:p-8 flex flex-col">
            <div className="mb-6 pb-6 border-b-4 border-[#111]">
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-4 tracking-tight">
                Web Design Strips <span className="bg-neo-red text-[#111] px-2 py-1 transform -rotate-2 inline-block shadow-[2px_2px_0px_0px_#111]">Back</span>
              </h2>
              <p className="text-xl md:text-2xl font-body font-bold mb-6 text-gray-700">
                Loud neon is fading. Soft pastels, strong grids, and high-contrast forms define the new brutalist aesthetic.
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
                  Minimalism meets brutalism, but with a touch of joy. Content is elevated through raw structure and soft colors, rather than distracting visual flair. 
                  The focus returns to readability, strong grids, and unyielding borders. 
                  A return to the fundamentals of the printed page applied to digital screens.
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
                Introducing soft colors focuses the eye on structure playfully. The tinted space becomes a gentle primary element.
              </p>
              <div className="border-2 border-[#111] p-4 bg-neo-yellow shadow-[4px_4px_0px_0px_#111] transform rotate-1">
                <p className="font-body font-bold text-center italic text-sm">"Less is more colorful." <br/>- Architect</p>
              </div>
            </article>

            {/* Sidebar Article 2 / Ad block */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="border-4 border-[#111] bg-neo-red p-6 h-full flex flex-col items-center justify-center text-center shadow-[6px_6px_0px_0px_#111] group hover:bg-white hover:text-[#111] transition-colors cursor-pointer text-[#111]">
                <h4 className="text-3xl font-black uppercase mb-2">Join Archive</h4>
                <p className="font-body text-sm font-bold mb-6">Preserve the structure.</p>
                <div className="w-full border-t-4 border-dashed border-[#111] mb-6"></div>
                <button className="border-4 border-[#111] bg-white text-[#111] group-hover:bg-[#111] group-hover:text-white py-2 px-6 font-black uppercase transition-colors w-full shadow-[4px_4px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                  Subscribe
                </button>
              </div>
            </div>

          </aside>
        </div>
        
        {/* Footer */}
        <footer className="border-t-4 border-[#111] p-4 bg-[#111] text-white text-center">
          <p className="font-body font-bold uppercase text-sm">
            © {new Date().getFullYear()} The Brutalist Archive. Form follows function.
          </p>
        </footer>
      </main>
    </div>
  );
}

