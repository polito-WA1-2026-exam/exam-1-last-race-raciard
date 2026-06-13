function Instructions() {
  return (
    <div className="max-w-3xl mx-auto p-8 border border-slate-800 bg-slate-900 shadow-2xl my-10">
      <h1 className="text-3xl font-black mb-10 text-slate-100 uppercase tracking-tighter border-b-4 border-slate-700 pb-4">How to Play</h1>
      
      <div className="space-y-10 text-slate-300">
        <section>
          <h2 className="font-bold text-xl mb-3 text-blue-400 uppercase tracking-widest">The Objective</h2>
          <p className="leading-relaxed">Navigate from a <span className="text-red-400 font-bold uppercase">Start</span> station to a <span className="text-green-400 font-bold uppercase">Destination</span>. Score points by reaching the goal with credits remaining.</p>
        </section>

        <section>
          <h2 className="font-bold text-xl mb-4 text-blue-400 uppercase tracking-widest">Game Phases</h2>
          <ul className="space-y-4">
            <li className="flex gap-4">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></span>
               <div>
                  <strong className="text-slate-100 block mb-1">1. Setup</strong> 
                  <span className="text-sm text-slate-400">View the full network layout and study the connections.</span>
               </div>
            </li>
            <li className="flex gap-4">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></span>
               <div>
                  <strong className="text-slate-100 block mb-1">2. Planning</strong> 
                  <span className="text-sm text-slate-400">Choose your path within 90 seconds. The lines will be hidden!</span>
               </div>
            </li>
            <li className="flex gap-4">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></span>
               <div>
                  <strong className="text-slate-100 block mb-1">3. Execution</strong> 
                  <span className="text-sm text-slate-400">Watch your character travel. Random events occur at each stop.</span>
               </div>
            </li>
          </ul>
        </section>

        <section className="bg-slate-800/50 p-6 border-l-4 border-yellow-500 rounded-r">
          <h2 className="font-bold text-lg mb-2 text-yellow-500 uppercase tracking-tighter">Critical Rules</h2>
          <p className="text-sm leading-relaxed italic text-slate-400">"Change lines only at interchange stations. Routes must be a continuous sequence. Attempting an invalid connection results in immediate system failure."</p>
        </section>
      </div>
    </div>
  );
}

export default Instructions;
