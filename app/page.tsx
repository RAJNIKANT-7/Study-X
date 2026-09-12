"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {usePathname,useRouter} from "next/navigation";

type Mode="Timer"|"Pomodoro"|"Stopwatch"|"Focus";
const modes:Mode[]=["Timer","Pomodoro","Stopwatch","Focus"];
const presets=[15,25,45,60,120];
const cats=["All","Streaks","Study Hours","Sessions","Social","Special"];
const achievements=[
["🌱","First Step","Complete your very first study session","Sessions",true,50],
["🔥","On a Roll","Maintain a 3-day study streak","Streaks",true,100],
["⚔️","Week Warrior","Study every day for 7 consecutive days","Streaks",true,250],
["💯","Century Club","Log 100 total study hours","Study Hours",true,500],
["🦉","Night Owl","Study after midnight 10 times","Special",true,200],
["🌅","Early Bird","Start a session before 6am on 5 different days","Special",true,200],
["🦋","Social Butterfly","Join 3 different study groups","Social",true,150],
["🏆","Iron Discipline","Study for 30 consecutive days","Streaks",false,1000,18,30],
["⚡","Half Millennium","Log 500 total study hours","Study Hours",false,1500,247,500],
["🎯","Session Master","Complete 200 study sessions","Sessions",false,600,134,200],
["👑","Leaderboard Legend","Reach the top 3 on the global leaderboard","Social",false,2000,0,1],
["🍅","Pomodoro Pro","Complete 500 Pomodoro sessions","Sessions",false,800,89,500],
["🌟","Millennium","Log 1000 total study hours","Study Hours",false,5000,247,1000],
["🤝","Study Buddy","Study in a group session 25 times","Social",false,400,11,25],
["🧘","Deep Focus","Complete a 4-hour uninterrupted session","Special",false,1000,0,1],
["📅","Consistency King","Study at the same time every day for 2 weeks","Streaks",false,350,5,14]
] as const;

function pad(n:number){return String(n).padStart(2,"0")}
function fmt(n:number){const h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return h?pad(h)+":"+pad(m)+":"+pad(s):pad(m)+":"+pad(s)}

function Timer(){
 const [mode,setMode]=useState<Mode>("Timer"),[total,setTotal]=useState(1500),[left,setLeft]=useState(1500),[run,setRun]=useState(false),[label,setLabel]=useState("Create your label"),[open,setOpen]=useState(false),[custom,setCustom]=useState({h:"",m:"",s:""}),[sound,setSound]=useState(true);
 const ref=useRef<ReturnType<typeof setInterval>|null>(null);
 useEffect(()=>{if(ref.current)clearInterval(ref.current);if(!run)return;ref.current=setInterval(()=>setLeft(v=>{if(mode!=="Stopwatch"&&v<=1){setRun(false);return 0}return mode==="Stopwatch"?v+1:v-1}),1000);return()=>{if(ref.current)clearInterval(ref.current)}},[run,mode]);
 const pct=total?((total-left)/total)*100:0;
 function choose(m:Mode){setRun(false);setMode(m);if(m==="Pomodoro"){setTotal(1500);setLeft(1500)}else if(m==="Focus"){setTotal(3000);setLeft(3000)}else{setTotal(0);setLeft(0)}}
 function preset(n:number){setMode("Timer");setTotal(n*60);setLeft(n*60);setRun(false)}
 function apply(){const n=(+custom.h||0)*3600+(+custom.m||0)*60+(+custom.s||0);if(n){setMode("Timer");setTotal(n);setLeft(n);setRun(false)}}
 function toggle(){if(mode==="Stopwatch"){setRun(v=>!v);return}if(!total)return;if(!left)setLeft(total);setRun(v=>!v)}
 return <main className="timer-page">
  <div className="mode-tabs glass-pill">{modes.map(m=><button key={m} onClick={()=>choose(m)} className={m===mode?"active-pill":""}>{m}</button>)}</div>
  <section className="duration-editor"><div className="eyebrow">Set duration</div><div className="duration-inputs">{(["h","m","s"] as const).map(k=><label key={k}><input value={custom[k]} maxLength={2} inputMode="numeric" onChange={e=>setCustom({...custom,[k]:e.target.value.replace(/\D/g,"")})}/><span>{k==="h"?"hours":k==="m"?"minutes":"seconds"}</span></label>)}</div><button className="mini-btn" onClick={apply}>Set custom</button><div className="presets">{presets.map(n=><button key={n} onClick={()=>preset(n)}>{n>=60?n/60+"h":n+"m"}</button>)}</div></section>
  <div className="timer-ring-wrap"><div className="timer-ring" style={{background:"conic-gradient(#8b5cf6 0%,#ec4899 "+Math.max(.5,pct)+"%,rgba(255,255,255,.06) "+Math.max(.5,pct)+"%)"}}><div className="timer-disc"><div className="timer-mode-label">{run?"In session":mode}</div><div className="timer-value">{fmt(left)}</div><div className="time-units"><span>HRS</span><span>MIN</span><span>SEC</span></div><div className="label-wrap"><button className="label-button" onClick={()=>setOpen(v=>!v)}>🏷️ {label} ⌄</button>{open&&<div className="label-menu">{["Mathematics","Physics","Chemistry","Computer Science","Biology"].map(x=><button key={x} onClick={()=>{setLabel(x);setOpen(false)}}>{x}</button>)}</div>}</div></div></div></div>
  <div className="controls"><button className="round-control" onClick={()=>{setRun(false);setLeft(mode==="Stopwatch"?0:total)}}>↺</button><button className="start-button" onClick={toggle}>{run?"⏸ Pause":!left&&total?"▶ Restart":"▶ Start Timer"}</button><button className="round-control" onClick={()=>setSound(v=>!v)}>{sound?"🔊":"🔇"}</button></div>
  <div className="bottom-tools"><button>☰ <span>Tasks</span></button><button onClick={()=>setSound(v=>!v)}>{sound?"🔊":"🔇"}</button><button>🎵</button><button>🎙 <span>Study Room</span><i>♛</i></button></div>
  <p className="quote">“The secret of getting ahead is getting started.”</p>
 </main>
}

function Achievements(){
 const [cat,setCat]=useState("All");
 const list=useMemo(()=>cat==="All"?achievements:achievements.filter(a=>a[3]===cat),[cat]);
 const unlocked=achievements.filter(a=>a[4]).length,xp=achievements.filter(a=>a[4]).reduce((s,a)=>s+a[5],0);
 return <main className="achievements-page"><div className="page-heading"><h1>Achievements</h1><p>Track your milestones and earn XP as you study</p></div>
 <div className="stats-grid">{[["🏅",unlocked+"/"+achievements.length,"Unlocked","#c084fc"],["⚡",xp.toLocaleString(),"Total XP","#f59e0b"],["🔥","18 days","Current Streak","#f97316"],["⏱️","247 h","Study Hours","#60a5fa"]].map(x=><div className="stat-card" key={x[2]}><span>{x[0]}</span><b style={{color:x[3]}}>{x[1]}</b><small>{x[2]}</small></div>)}</div>
 <div className="category-filters">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?"active-filter":""}>{c}</button>)}</div>
 <div className="result-line"><span>{list.filter(a=>a[4]).length} unlocked · {list.filter(a=>!a[4]).length} locked</span><i/></div>
 <div className="achievement-grid">{list.map(a=>{const p=a[6]&&a[7]?Math.min(100,a[6]/a[7]*100):0;return <article key={a[1]} className="achievement-card" style={{opacity:a[4]?1:.55,borderColor:a[4]?"rgba(192,132,252,.2)":"rgba(255,255,255,.06)"}}><div className="achievement-top"><div className="achievement-icon">{a[0]}</div><span className="rarity">{a[4]?"Unlocked":"Locked"}</span></div><div><h3>{a[1]}</h3><p>{a[2]}</p></div><div className="achievement-footer">{a[4]?<><span>Completed</span><b>+{a[5]} XP</b></>:<>{a[6]!=null&&<><span>{a[6]} / {a[7]}</span><div className="progress-track"><div style={{width:p+"%"}}/></div></>}<span>+{a[5]} XP</span></>}</div></article>})}</div>
 </main>
}

export default function Page(){
 const path=usePathname(),router=useRouter(),isAch=path==="/achievements";
 const nav=["Timer","Progress","Leaderboard","Achievements","AI Helper","Pricing"],routes:Record<string,string>={Timer:"/timer",Progress:"/progress",Leaderboard:"/leaderboard",Achievements:"/achievements","AI Helper":"/ai-helper",Pricing:"/pricing"};
 return <div className="study-x-app"><div className="aurora aurora-one"/><div className="aurora aurora-two"/><div className="aurora aurora-three"/>
 <nav className="top-nav"><button className="brand" onClick={()=>router.push("/timer")}><span>📖</span><b><em>Study</em> X</b></button><div className="nav-pill glass-pill">{nav.map(n=><button key={n} onClick={()=>router.push(routes[n])} className={(n==="Achievements"&&isAch)||(n==="Timer"&&path!=="/achievements"&&path==="/timer")?"active-pill":""}>{n}</button>)}</div><div className="nav-right"><button className="icon-button">🔔</button><button className="avatar">A</button></div></nav>
 <div className="content">{isAch?<Achievements/>:<Timer/>}</div><div className="status-bar"><span><i/> All operations normal</span><span><i/> 271 studying now</span></div></div>
}
