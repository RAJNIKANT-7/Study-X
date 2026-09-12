"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {usePathname,useRouter} from "next/navigation";

type Mode="Timer"|"Pomodoro"|"Stopwatch"|"Focus";
const modes:Mode[]=["Timer","Pomodoro","Stopwatch","Focus"];
const presets=[15,25,45,60,120];
const cats=["All","Streaks","Study Hours","Sessions","Social","Special"];
const achievements=[
["01","First Step","Complete your very first study session","Sessions",true,50],
["02","On a Roll","Maintain a 3-day study streak","Streaks",true,100],
["03","Week Warrior","Study every day for 7 consecutive days","Streaks",true,250],
["04","Century Club","Log 100 total study hours","Study Hours",true,500],
["05","Night Owl","Study after midnight 10 times","Special",true,200],
["06","Early Bird","Start a session before 6am on 5 different days","Special",true,200],
["07","Social Butterfly","Join 3 different study groups","Social",true,150],
["08","Iron Discipline","Study for 30 consecutive days","Streaks",false,1000,18,30],
["09","Half Millennium","Log 500 total study hours","Study Hours",false,1500,247,500],
["10","Session Master","Complete 200 study sessions","Sessions",false,600,134,200],
["11","Leaderboard Legend","Reach the top 3 on the global leaderboard","Social",false,2000,0,1],
["12","Pomodoro Pro","Complete 500 Pomodoro sessions","Sessions",false,800,89,500],
["13","Millennium","Log 1000 total study hours","Study Hours",false,5000,247,1000],
["14","Study Buddy","Study in a group session 25 times","Social",false,400,11,25],
["15","Deep Focus","Complete a 4-hour uninterrupted session","Special",false,1000,0,1],
["16","Consistency King","Study at the same time every day for 2 weeks","Streaks",false,350,5,14]
] as const;

function pad(n:number){return String(n).padStart(2,"0")}
function fmt(n:number){const h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return h?pad(h)+":"+pad(m)+":"+pad(s):pad(m)+":"+pad(s)}

function Timer(){
 const [mode,setMode]=useState<Mode>("Timer"),[total,setTotal]=useState(1500),[left,setLeft]=useState(1500),[run,setRun]=useState(false),[label,setLabel]=useState("Choose subject"),[open,setOpen]=useState(false),[custom,setCustom]=useState({h:"",m:"",s:""}),[sound,setSound]=useState(true);
 const ref=useRef<ReturnType<typeof setInterval>|null>(null);
 useEffect(()=>{if(ref.current)clearInterval(ref.current);if(!run)return;ref.current=setInterval(()=>setLeft(v=>{if(mode!=="Stopwatch"&&v<=1){setRun(false);return 0}return mode==="Stopwatch"?v+1:v-1}),1000);return()=>{if(ref.current)clearInterval(ref.current)}},[run,mode]);
 const pct=mode==="Stopwatch"?100:total?((total-left)/total)*100:0;
 function choose(m:Mode){setRun(false);setMode(m);if(m==="Pomodoro"){setTotal(1500);setLeft(1500)}else if(m==="Focus"){setTotal(3000);setLeft(3000)}else if(m==="Stopwatch"){setTotal(0);setLeft(0)}else{setTotal(1500);setLeft(1500)}}
 function preset(n:number){setMode("Timer");setTotal(n*60);setLeft(n*60);setRun(false)}
 function apply(){const n=(+custom.h||0)*3600+(+custom.m||0)*60+(+custom.s||0);if(n){setMode("Timer");setTotal(n);setLeft(n);setRun(false)}}
 function toggle(){if(mode==="Stopwatch"){setRun(v=>!v);return}if(!total)return;if(!left)setLeft(total);setRun(v=>!v)}
 return <main className="timer-page">
  <div className="timer-intro"><span className="section-kicker">FOCUS / 01</span><h1>Make time for what matters.</h1><p>A quiet workspace for deliberate study.</p></div>
  <div className="mode-tabs glass-pill">{modes.map(m=><button key={m} onClick={()=>choose(m)} className={m===mode?"active-pill":""}>{m}</button>)}</div>
  <section className="duration-editor glass-panel"><div className="eyebrow">Session duration</div><div className="duration-inputs">{(["h","m","s"] as const).map(k=><label key={k}><input aria-label={k+" duration"} value={custom[k]} maxLength={2} inputMode="numeric" onChange={e=>setCustom({...custom,[k]:e.target.value.replace(/\D/g,"")})}/><span>{k==="h"?"hours":k==="m"?"minutes":"seconds"}</span></label>)}</div><button className="mini-btn" onClick={apply}>Apply custom time</button><div className="presets">{presets.map(n=><button key={n} onClick={()=>preset(n)}>{n>=60?n/60+"h":n+"m"}</button>)}</div></section>
  <section className="clock-card glass-panel"><div className="clock-top"><span className="timer-mode-label">{run?"SESSION ACTIVE":mode.toUpperCase()}</span><span className="clock-status">{Math.round(pct)}% complete</span></div><div className="big-clock">{fmt(left)}</div><div className="clock-bottom"><div className="time-units"><span>HOURS</span><span>MINUTES</span><span>SECONDS</span></div><div className="label-wrap"><button className="label-button" onClick={()=>setOpen(v=>!v)}>{label} <span>⌄</span></button>{open&&<div className="label-menu">{["Mathematics","Physics","Chemistry","Computer Science","Biology"].map(x=><button key={x} onClick={()=>{setLabel(x);setOpen(false)}}>{x}</button>)}</div>}</div></div><div className="clock-progress"><div style={{width:Math.min(100,Math.max(0,pct))+"%"}}/></div></section>
  <div className="controls"><button className="round-control" aria-label="Reset" onClick={()=>{setRun(false);setLeft(mode==="Stopwatch"?0:total)}}>↺</button><button className="start-button" onClick={toggle}>{run?"Pause":!left&&total?"Restart":"Start session"}</button><button className="round-control" aria-label="Toggle sound" onClick={()=>setSound(v=>!v)}>{sound?"◉":"○"}</button></div>
  <div className="bottom-tools"><button onClick={()=>document.getElementById("task-list")?.scrollIntoView({behavior:"smooth"})}>Tasks</button><button onClick={()=>setSound(v=>!v)}>{sound?"Sound on":"Sound off"}</button><button>Ambient</button><button>Study room</button></div><section id="task-list" className="task-panel glass-panel"><div className="task-heading"><div><span className="section-kicker">WORKSPACE / 03</span><h2>Today&apos;s tasks</h2></div><span className="task-count">0 / 4 complete</span></div><div className="task-add"><input placeholder="Add a study task..." onKeyDown={e=>{if(e.key==="Enter"){const v=e.currentTarget.value.trim();if(v){const el=document.createElement("div");el.className="task-item";const check=document.createElement("button");check.className="task-check";check.textContent="○";const span=document.createElement("span");span.textContent=v;const del=document.createElement("button");del.className="task-delete";del.textContent="×";check.onclick=()=>{el.classList.toggle("done");check.textContent=el.classList.contains("done")?"✓":"○"};del.onclick=()=>el.remove();el.append(check,span,del);document.getElementById("task-items")?.appendChild(el);e.currentTarget.value=""}}}}/><span>ENTER</span></div><div id="task-items" className="task-items"><div className="task-empty">No tasks yet. Add one above and keep your session focused.</div></div></section>
  <div className="timer-meta"><span>25:00 recommended</span><span>Session 01</span><span>Distraction-free</span></div>
 </main>
}

function Achievements(){
 const [cat,setCat]=useState("All");
 const list=useMemo(()=>cat==="All"?achievements:achievements.filter(a=>a[3]===cat),[cat]);
 const unlocked=achievements.filter(a=>a[4]).length,xp=achievements.filter(a=>a[4]).reduce((s,a)=>s+a[5],0);
 return <main className="achievements-page"><div className="page-heading"><span className="section-kicker">PROGRESS / 02</span><h1>Achievements</h1><p>Small milestones. Long-term consistency.</p></div>
 <div className="stats-grid">{[["01",unlocked+"/"+achievements.length,"Unlocked"],["02",xp.toLocaleString(),"Total XP"],["03","18 days","Current streak"],["04","247 h","Study hours"]].map(x=><div className="stat-card" key={x[2]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}</div>
 <div className="category-filters">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?"active-filter":""}>{c}</button>)}</div>
 <div className="result-line"><span>{list.filter(a=>a[4]).length} unlocked · {list.filter(a=>!a[4]).length} locked</span><i/></div>
 <div className="achievement-grid">{list.map(a=>{const p=a[6]&&a[7]?Math.min(100,a[6]/a[7]*100):0;return <article key={a[1]} className={"achievement-card "+(!a[4]?"locked":"")}><div className="achievement-top"><div className="achievement-icon">{a[0]}</div><span className="rarity">{a[4]?"Complete":"Locked"}</span></div><div><h3>{a[1]}</h3><p>{a[2]}</p></div><div className="achievement-footer">{a[4]?<><span>Completed</span><b>+{a[5]} XP</b></>:<><span>{a[6]} / {a[7]}</span><div className="progress-track"><div style={{width:p+"%"}}/></div><span>+{a[5]} XP</span></>}</div></article>})}</div>
 </main>
}

export default function Page(){
 const path=usePathname(),router=useRouter(),isAch=path==="/achievements";
 const nav=["Timer","Progress","Leaderboard","Achievements","AI Helper","Pricing"],routes:Record<string,string>={Timer:"/timer",Progress:"/progress",Leaderboard:"/leaderboard",Achievements:"/achievements","AI Helper":"/ai-helper",Pricing:"/pricing"};
 return <div className="study-x-app"><div className="grain"/><div className="ambient-glow"/>
 <nav className="top-nav"><button className="brand" onClick={()=>router.push("/timer")}><span className="brand-mark">SX</span><b>Study<span> X</span></b></button><div className="nav-pill glass-pill">{nav.map(n=><button key={n} onClick={()=>router.push(routes[n])} className={(n==="Achievements" && isAch) || (n==="Timer" && path==="/timer") ? "active-pill" : ""}>{n}</button>)}</div><div className="nav-right"><button className="nav-action" aria-label="Notifications">•••</button><button className="avatar">S</button></div></nav>
 <div className="content">{isAch?<Achievements/>:<Timer/>}</div><div className="status-bar"><span><i/> Systems normal</span><span>Study X · 2026</span></div></div>
}