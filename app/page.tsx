"use client";
import {useEffect,useMemo,useState} from "react";
import {Check,ChevronDown,Clock3,Flame,Menu,Pause,Play,RotateCcw,Settings,Timer,Volume2,X} from "lucide-react";

type Mode="timer"|"clock"|"pomodoro"|"stopwatch";
const labels=["Mathematics","Physics","Chemistry","Computer Science","Biology"];
const quick=[15,25,45,60,120];

function pad(n:number){return String(Math.max(0,n)).padStart(2,"0")}
function format(sec:number){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${pad(h)}:${pad(m)}:${pad(s)}`:`${pad(m)}:${pad(s)}`}

export default function Page(){
 const [mode,setMode]=useState<Mode>("timer");
 const [seconds,setSeconds]=useState(0);
 const [initial,setInitial]=useState(0);
 const [running,setRunning]=useState(false);
 const [mobile,setMobile]=useState(false);
 const [label,setLabel]=useState("Mathematics");
 const [showLabels,setShowLabels]=useState(false);
 const [hours,setHours]=useState("");
 const [minutes,setMinutes]=useState("");
 const [secs,setSecs]=useState("");
 const [volume,setVolume]=useState(true);
 const [sessions,setSessions]=useState(0);
 const [today,setToday]=useState(0);
 const [streak,setStreak]=useState(0);

 useEffect(()=>{
   try{
    setSessions(Number(localStorage.getItem("sx-sessions")||0));
    setToday(Number(localStorage.getItem("sx-today")||0));
    setStreak(Number(localStorage.getItem("sx-streak")||0));
   }catch{}
 },[]);

 useEffect(()=>{
   if(!running)return;
   const id=window.setInterval(()=>{
     setSeconds(v=>{
       if(mode==="stopwatch")return v+1;
       if(v<=1){window.clearInterval(id);setRunning(false);complete();return 0}
       return v-1;
     });
   },1000);
   return()=>window.clearInterval(id);
 },[running,mode]);

 function complete(){
   if(mode==="stopwatch"||initial>0){
    const mins=Math.max(1,Math.round((mode==="stopwatch"?seconds:initial)/60));
    const ns=sessions+1,nt=today+mins;
    setSessions(ns);setToday(nt);
    try{localStorage.setItem("sx-sessions",String(ns));localStorage.setItem("sx-today",String(nt));localStorage.setItem("sx-streak",String(Math.max(1,streak)))}catch{}
   }
 }
 function start(){
   if(mode==="stopwatch"){setSeconds(0);setRunning(true);return}
   const n=seconds>0?seconds:1500;
   setInitial(n);setSeconds(n);setRunning(true);
 }
 function reset(){setRunning(false);setSeconds(mode==="stopwatch"?0:initial||0)}
 function setQuick(n:number){setRunning(false);setInitial(n*60);setSeconds(n*60);setMode("timer")}
 function setCustom(){
   const n=(Number(hours)||0)*3600+(Number(minutes)||0)*60+(Number(secs)||0);
   if(n>0){setRunning(false);setInitial(n);setSeconds(n)}
 }
 function choose(m:Mode){
   if(running)return;
   setMode(m);
   if(m==="stopwatch"){setSeconds(0);setInitial(0)}
   else if(m==="pomodoro"){setSeconds(1500);setInitial(1500)}
 }
 const ring=Math.max(0,Math.min(100,initial?seconds/initial*100:0));
 const modeName=mode==="timer"?"Timer":mode==="clock"?"Clock":mode==="pomodoro"?"Pomodoro":"Stopwatch";

 return <main className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-white/20">
  <style jsx global>{`
   *{box-sizing:border-box}body{margin:0;background:#050505;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
   button,input,select{font:inherit}.fade{transition:background .2s,border-color .2s,color .2s,transform .2s}.fade:hover{background:rgba(255,255,255,.07)}
   .thin{border-color:rgba(255,255,255,.09)}
   .ring{background:conic-gradient(rgba(255,255,255,.2) ${ring}%,rgba(255,255,255,.055) 0)}
   @media(max-width:760px){.desktop-nav{display:none}.timer-circle{width:300px!important;height:300px!important}.timer-value{font-size:54px!important}.side-links{display:none}}
  `}</style>

  <header className="fixed inset-x-0 top-0 z-50 border-b thin bg-[#050505]/90 backdrop-blur-xl">
   <div className="mx-auto flex h-14 max-w-[1450px] items-center justify-between px-4 md:px-6">
    <button onClick={()=>setMobile(!mobile)} className="mr-3 grid h-8 w-8 place-items-center rounded-lg text-zinc-500 md:hidden">{mobile?<X size={17}/>:<Menu size={17}/>}</button>
    <button className="flex items-center gap-2.5 text-sm font-medium tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-[10px]">SX</span>Study X
    </button>
    <nav className="desktop-nav ml-8 flex flex-1 items-center gap-0.5">
      {["Timer","Progress","Dashboard","Habits","AI Helper","Labels","Groups","Leaderboard","Pricing"].map((x,i)=>
       <button key={x} className={`fade rounded-lg px-3 py-2 text-[11px] ${i===0?"bg-white/[.06] text-white":"text-zinc-500"}`}>{x}</button>
      )}
    </nav>
    <div className="flex items-center gap-1">
      <button className="fade rounded-lg border thin px-3 py-1.5 text-[11px] text-zinc-400">Your Stats <Flame size={12} className="ml-1 inline text-amber-300"/></button>
      <button className="fade grid h-8 w-8 place-items-center rounded-lg text-zinc-500"><Settings size={15}/></button>
    </div>
   </div>
   {mobile&&<div className="border-t thin bg-[#070707] p-2 md:hidden">{["Timer","Progress","Dashboard","Habits","AI Helper","Labels","Groups","Leaderboard","Pricing"].map(x=><button key={x} className="block w-full rounded-lg px-3 py-2.5 text-left text-xs text-zinc-400 hover:bg-white/[.05]">{x}</button>)}</div>}
  </header>

  <section className="mx-auto flex min-h-screen max-w-[1050px] flex-col items-center px-4 pb-16 pt-24">
    <div className="flex items-center gap-1 rounded-full border thin bg-white/[.015] p-1">
      {(["timer","clock","pomodoro","stopwatch"] as Mode[]).map(m=>
       <button key={m} onClick={()=>choose(m)} className={`fade rounded-full px-4 py-2 text-[10px] uppercase tracking-wide ${mode===m?"bg-white/[.09] text-white":"text-zinc-600"}`}>{m}</button>
      )}
    </div>

    <div className="mt-8 text-center">
      <p className="text-[9px] uppercase tracking-[.28em] text-zinc-600">Set duration</p>
      <div className="mt-5 flex items-center justify-center gap-2">
       {[["h",hours,setHours],["m",minutes,setMinutes],["s",secs,setSecs]].map(([k,v,set]:any)=>
        <div key={k} className="text-center">
          <input value={v} onChange={e=>set(e.target.value.replace(/\\D/g,"").slice(0,2))} className="h-12 w-16 rounded-lg border thin bg-white/[.02] text-center text-xl font-light text-zinc-300 outline-none focus:border-white/25" />
          <div className="mt-1 text-[8px] uppercase tracking-widest text-zinc-700">{k==="h"?"hours":k==="m"?"minutes":"seconds"}</div>
        </div>
       )}
      </div>
      <button onClick={setCustom} className="mt-3 rounded-md border thin px-3 py-1.5 text-[9px] text-zinc-500 hover:text-zinc-300">Set custom</button>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
       {quick.map(n=><button key={n} onClick={()=>setQuick(n)} className="fade rounded-md border thin px-3 py-1.5 text-[9px] text-zinc-500">{n>=60?n/60+"h":n+"m"}</button>)}
      </div>
    </div>

    <div className="relative mt-9 grid place-items-center">
      <div className="timer-circle ring grid h-[380px] w-[380px] place-items-center rounded-full p-[1px]">
       <div className="grid h-full w-full place-items-center rounded-full bg-[#050505]">
        <div className="text-center">
         <div className="mb-3 text-[9px] uppercase tracking-[.3em] text-zinc-600">{running?"In session":modeName}</div>
         <div className="timer-value text-[68px] font-light tracking-[-.06em] tabular-nums">{format(seconds)}</div>
         <button onClick={()=>setShowLabels(!showLabels)} className="fade mt-5 rounded-full border thin px-3 py-1.5 text-[9px] text-zinc-500">{label}<ChevronDown size={11} className="ml-1 inline"/></button>
         {showLabels&&<div className="absolute left-1/2 top-[calc(100%+8px)] z-20 w-44 -translate-x-1/2 rounded-xl border thin bg-[#111]/95 p-1 text-left shadow-2xl backdrop-blur-xl">{labels.map(x=><button key={x} onClick={()=>{setLabel(x);setShowLabels(false)}} className="block w-full rounded-lg px-3 py-2 text-[10px] text-zinc-400 hover:bg-white/[.06]">{x}</button>)}</div>}
        </div>
       </div>
      </div>
    </div>

    <div className="mt-8 flex items-center gap-2">
      <button onClick={start} className="fade min-w-36 rounded-full bg-white px-7 py-3 text-[11px] font-medium text-black">{running?<><Pause size={13} className="mr-2 inline"/>Pause</>:<><Play size={13} className="mr-2 inline"/>Start Timer</>}</button>
      <button onClick={reset} className="fade grid h-10 w-10 place-items-center rounded-full border thin text-zinc-500"><RotateCcw size={14}/></button>
      <button onClick={()=>setVolume(!volume)} className={`fade grid h-10 w-10 place-items-center rounded-full border thin ${volume?"text-zinc-400":"text-zinc-700"}`}><Volume2 size={14}/></button>
    </div>

    <p className="mt-6 text-[10px] italic text-zinc-700">The secret of getting ahead is getting started.</p>

    <div className="mt-10 grid w-full max-w-xl grid-cols-3 overflow-hidden rounded-xl border thin bg-white/[.015]">
      {[["🔥",streak,"DAY STREAK"],["✓",sessions,"SESSIONS"],["◷",today,"MINUTES"]].map(([i,v,l])=><div key={l as string} className="border-r thin p-4 text-center last:border-0"><div className="text-xs text-zinc-600">{i}</div><div className="mt-1 text-lg font-light">{v}</div><div className="mt-1 text-[8px] tracking-[.18em] text-zinc-700">{l}</div></div>)}
    </div>

    <div className="mt-12 flex flex-wrap justify-center gap-2">
      <button className="fade rounded-full border thin px-4 py-2 text-[9px] text-zinc-500"><Check size={11} className="mr-1.5 inline"/>Todo List</button>
      <button className="fade rounded-full border thin px-4 py-2 text-[9px] text-zinc-500"><Timer size={11} className="mr-1.5 inline"/>Focus</button>
      <button className="fade rounded-full border thin px-4 py-2 text-[9px] text-zinc-500"><Clock3 size={11} className="mr-1.5 inline"/>History</button>
    </div>
  </section>

  <footer className="border-t thin px-5 py-8 text-center">
   <p className="text-[10px] text-zinc-700">Study X · A focused study workspace</p>
  </footer>
 </main>
}