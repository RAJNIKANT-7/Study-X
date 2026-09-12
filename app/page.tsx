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
 const [mode,setMode]=useState<Mode>("Timer"),[total,setTotal]=useState(1500),[left,setLeft]=useState(1500),[run,setRun]=useState(false),[label,setLabel]=useState("Choose subject"),[open,setOpen]=useState(false),[custom,setCustom]=useState({h:"",m:"",s:""}),[customOpen,setCustomOpen]=useState(false),[sound,setSound]=useState(true);
 const [tasks,setTasks]=useState<{id:number;text:string;done:boolean}[]>([]),[taskText,setTaskText]=useState("");
 const ref=useRef<ReturnType<typeof setInterval>|null>(null);
 useEffect(()=>{try{const saved=localStorage.getItem("study-x-tasks");if(saved)setTasks(JSON.parse(saved))}catch{}},[]);
 useEffect(()=>{const pull=async()=>{try{const a=await fetch("/api/auth");const auth=await a.json();if(!auth.loggedIn)return;const r=await fetch("/api/sync");if(!r.ok)return;const x=await r.json();if(x.data?.progress)localStorage.setItem("study-x-progress",JSON.stringify(x.data.progress));if(Array.isArray(x.data?.tasks)){setTasks(x.data.tasks);localStorage.setItem("study-x-tasks",JSON.stringify(x.data.tasks))}}catch{}};pull();window.addEventListener("studyx-login",pull);return()=>window.removeEventListener("studyx-login",pull)},[]);
 useEffect(()=>{const push=async()=>{try{const a=await fetch("/api/auth");const auth=await a.json();if(!auth.loggedIn)return;const progress=JSON.parse(localStorage.getItem("study-x-progress")||"{\"seconds\":0,\"sessions\":0,\"daily\":{}}");await fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({progress,tasks})})}catch{}};const id=setInterval(push,15000);return()=>clearInterval(id)},[tasks]);
 useEffect(()=>{try{localStorage.setItem("study-x-tasks",JSON.stringify(tasks))}catch{}},[tasks]);
 useEffect(()=>{if(ref.current)clearInterval(ref.current);if(!run)return;ref.current=setInterval(()=>{recordStudySecond();setLeft(v=>{if(mode!=="Stopwatch"&&v<=1){try{const key="study-x-progress";const d=JSON.parse(localStorage.getItem(key)||"{\"seconds\":0,\"sessions\":0,\"daily\":{}}");d.sessions=(d.sessions||0)+1;localStorage.setItem(key,JSON.stringify(d))}catch{}setRun(false);return 0}return mode==="Stopwatch"?v+1:v-1});},1000);return()=>{if(ref.current)clearInterval(ref.current)}},[run,mode]);
 const pct=mode==="Stopwatch"?100:total?((total-left)/total)*100:0;
 function choose(m:Mode){setRun(false);setMode(m);if(m==="Pomodoro"){setTotal(1500);setLeft(1500)}else if(m==="Focus"){setTotal(3000);setLeft(3000)}else if(m==="Stopwatch"){setTotal(0);setLeft(0)}else{setTotal(1500);setLeft(1500)}}
 function preset(n:number){setMode("Timer");setTotal(n*60);setLeft(n*60);setRun(false)}
 function apply(){const n=(+custom.h||0)*3600+(+custom.m||0)*60+(+custom.s||0);if(n){setMode("Timer");setTotal(n);setLeft(n);setRun(false)}}
 function toggle(){if(mode==="Stopwatch"){setRun(v=>!v);return}if(!total)return;if(!left)setLeft(total);setRun(v=>!v)}
 function addTask(){const v=taskText.trim();if(!v)return;setTasks(t=>[...t,{id:Date.now(),text:v,done:false}]);setTaskText("")}
  function recordStudySecond(){try{const key="study-x-progress";const raw=localStorage.getItem(key);const data=raw?JSON.parse(raw):{seconds:0,sessions:0,daily:{}};data.seconds=(data.seconds||0)+1;const day=new Date().toISOString().slice(0,10);data.daily=data.daily||{};data.daily[day]=(data.daily[day]||0)+1;localStorage.setItem(key,JSON.stringify(data))}catch{}}
 const done=tasks.filter(t=>t.done).length;
 return <main className="timer-page">
  <div className="timer-intro"><span className="section-kicker">FOCUS / 01</span><h1>Make time for what matters.</h1><p>A quiet workspace for deliberate study.</p></div>
  <div className="mode-tabs glass-pill">{modes.map(m=><button key={m} onClick={()=>choose(m)} className={m===mode?"active-pill":""}>{m}</button>)}</div>
  <div className="timer-workspace"><aside className="session-side glass-panel"><div className="side-label">SESSION</div><div className="side-title">Choose your pace.</div><div className="preset-stack">{presets.map(n=><button key={n} onClick={()=>preset(n)} className={total===n*60&&mode==="Timer"?"selected-preset":""}><span>{n>=60?n/60+"h":n+"m"}</span><small>{n===25?"recommended":n===50?"deep focus":"quick session"}</small></button>)}</div><button className={"custom-trigger "+(customOpen?"open":"")} onClick={()=>setCustomOpen(v=>!v)}><span><b>Custom time</b><small>Set your own duration</small></span><i>{customOpen?"−":"+"}</i></button>{customOpen&&<div className="custom-box"><div className="custom-fields">{(["h","m","s"] as const).map(k=><label key={k}><input aria-label={k+" duration"} value={custom[k]} maxLength={2} inputMode="numeric" placeholder="00" onChange={e=>setCustom({...custom,[k]:e.target.value.replace(/\D/g,"")})}/><span>{k}</span></label>)}</div><button onClick={apply}>Apply duration</button></div>}<div className="side-subject"><span>SUBJECT</span><button className="label-button" onClick={()=>setOpen(v=>!v)}>{label}<span>⌄</span></button>{open&&<div className="label-menu">{["Mathematics","Physics","Chemistry","Computer Science","Biology"].map(x=><button key={x} onClick={()=>{setLabel(x);setOpen(false)}}>{x}</button>)}</div>}</div></aside><div className="timer-center"><section className="clock-card glass-panel"><div className="clock-top"><span className="timer-mode-label">{run?"SESSION ACTIVE":mode.toUpperCase()}</span><span className="clock-status">{Math.round(pct)}% complete</span></div><div className="big-clock">{fmt(left)}</div><div className="clock-bottom"><div className="time-units"><span>HOURS</span><span>MINUTES</span><span>SECONDS</span></div></div><div className="clock-progress"><div style={{width:Math.min(100,Math.max(0,pct))+"%"}}/></div></section><div className="controls"><button className="round-control" aria-label="Reset" onClick={()=>{setRun(false);setLeft(mode==="Stopwatch"?0:total)}}>↺</button><button className="start-button" onClick={toggle}>{run?"Pause":!left&&total?"Restart":"Start session"}</button><button className="round-control" aria-label="Toggle sound" onClick={()=>setSound(v=>!v)}>{sound?"◉":"○"}</button></div><div className="bottom-tools"><button onClick={()=>document.getElementById("task-list")?.scrollIntoView({behavior:"smooth"})}>Tasks</button><button onClick={()=>setSound(v=>!v)}>{sound?"Sound on":"Sound off"}</button><button>Ambient</button><button>Study room</button></div></div><section id="task-list" className="task-panel glass-panel"><div className="task-heading"><div><span className="section-kicker">WORKSPACE / 03</span><h2>Today&apos;s tasks</h2></div><span className="task-count">{done} / {tasks.length} complete</span></div><form className="task-add" onSubmit={e=>{e.preventDefault();addTask()}}><input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="Add a study task..." aria-label="Add a study task"/><button type="submit">ADD</button></form><div className="task-items">{tasks.length===0?<div className="task-empty">No tasks yet. Add one above and keep your session focused.</div>:tasks.map(t=><div className={"task-item "+(t.done?"done":"")} key={t.id}><button type="button" className="task-check" aria-label={t.done?"Mark incomplete":"Mark complete"} onClick={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done?"✓":""}</button><span>{t.text}</span><button type="button" className="task-delete" aria-label="Delete task" onClick={()=>setTasks(ts=>ts.filter(x=>x.id!==t.id))}>×</button></div>)}</div></section></div><div className="timer-meta"><span>25:00 recommended</span><span>Session 01</span><span>Distraction-free</span></div>
 </main>
}
function PathwayProgress(){
 const pathways=[["Fool","Sequence 9","Begin your journey","Complete 3 study sessions",3],["Error","Sequence 9","Sharpen your consistency","Study for 5 total hours",18000],["Door","Sequence 9","Open a new route","Study on 3 different days",3],["Sun","Sequence 9","Build your discipline","Complete a 7-day streak",7]] as const;
 const [data,setData]=useState({seconds:0,sessions:0,daily:{}} as {seconds:number;sessions:number;daily:Record<string,number>});
 useEffect(()=>{const load=()=>{try{setData(JSON.parse(localStorage.getItem("study-x-progress")||"{\"seconds\":0,\"sessions\":0,\"daily\":{}}"))}catch{}};load();const id=setInterval(load,1000);return()=>clearInterval(id)},[]);
 const days=Object.keys(data.daily||{}).length; const streak=Math.max(0,days);
 const checks=[data.sessions||0, data.seconds||0, days, streak];
 return <main className="pathways-page"><div className="page-heading"><span className="section-kicker">PATHWAYS / 02</span><h1>Pathways</h1><p>Progress through sequences by completing real study challenges.</p></div><section className="pathway-hero glass-panel"><div><span className="pathway-kicker">YOUR CURRENT PATH</span><h2>Choose a pathway. Earn your sequence.</h2><p>Every completed challenge advances your sequence. Nothing unlocks without actual progress.</p></div><div className="sequence-core"><span>SEQ.</span><b>9</b><small>ENTRY</small></div></section><div className="pathway-grid">{pathways.map((p,i)=>{const value=checks[i];const target=p[4];const percent=Math.min(100,Math.round((value/target)*100));const unlocked=percent>=100;return <article className={"pathway-card glass-panel "+(unlocked?"unlocked":"")} key={p[0]}><div className="pathway-top"><span className="pathway-number">0{i+1}</span><span className={unlocked?"unlocked-badge":"locked-badge"}>{unlocked?"SEQUENCE READY":"LOCKED"}</span></div><h3>{p[0]}</h3><strong>{p[1]}</strong><p>{p[2]}</p><div className="challenge"><span>CHALLENGE</span><b>{p[3]}</b><div className="path-track"><i style={{width:percent+"%"}}/></div><div className="path-footer"><span>{i===1?Math.floor(value/3600)+" / 5 h":value+" / "+target}</span><b>{unlocked?"✓ UNLOCKED":percent+"%"}</b></div></div></article>})}</div><div className="sequence-road glass-panel"><div><span className="section-kicker">SEQUENCE ROAD</span><h2>Sequence 9 → Sequence 0</h2></div><div className="road"><span className="current">09</span><i/><span>08</span><i/><span>07</span><i/><span>06</span><i/><span>05</span><i/><span>04</span><i/><span>03</span><i/><span>02</span><i/><span>01</span><i/><span>00</span></div><small>Complete pathway challenges to advance.</small></div></main>
}

function Syllabus(){
 const [tab,setTab]=useState<"HSC"|"MHT-CET">("HSC");
 const hsc={
  Physics:[["Rotational Dynamics","5"],["Mechanical Properties of Fluids","5"],["Kinetic Theory of Gases and Radiation","5"],["Thermodynamics","5"],["Oscillations","4"],["Superposition of Waves","4"],["Wave Optics","5"],["Electrostatics","4"],["Current Electricity","4"],["Magnetic Fields due to Electric Current","4"],["Magnetic Materials","4"],["Electromagnetic Induction","5"],["AC Circuits","4"],["Dual Nature of Radiation and Matter","4"],["Structure of Atoms and Nuclei","4"],["Semiconductor Devices","4"]],
  Chemistry:[["Solid State","4"],["Solutions","5"],["Ionic Equilibria","4"],["Chemical Thermodynamics","6"],["Electrochemistry","5"],["Chemical Kinetics","4"],["p-Block Elements","8"],["d- and f-Block Elements","5"],["Coordination Compounds","3"],["Halogen Derivatives of Alkanes and Arenes","4"],["Alcohols, Phenols and Ethers","4"],["Aldehydes, Ketones and Carboxylic Acids","5"],["Organic Compounds Containing Nitrogen","4"],["Biomolecules","4"],["Introduction to Polymer Chemistry","3"],["Green Chemistry and Nanochemistry / Chemistry in Everyday Life","3"]],
  Mathematics:[["Mathematical Logic","8*"],["Matrices","6*"],["Trigonometric Functions","10*"],["Pair of Straight Lines","6*"],["Vectors","12*"],["Line and Plane","10*"],["Linear Programming","4*"],["Differentiation","9*"],["Applications of Derivatives","9*"],["Indefinite Integration","10*"],["Definite Integration","6*"],["Application of Definite Integration","4*"],["Differential Equations","8*"],["Probability Distributions","5*"],["Binomial Distribution","5*"]]
 } as Record<string,string[][]>;
 const cet={
  Physics:[["Measurement","2%"],["Scalars and Vectors","2%"],["Force","2%"],["Circular Motion","6%"],["Gravitation","4%"],["Rotational Motion","8%"],["Oscillation","8%"],["Wave Motion","4%"],["Stationary Waves","8%"],["Kinetic Theory of Gases & Thermodynamics","6%"],["Wave Theory of Light","6%"],["Interference & Diffraction","6%"],["Electrostatics","4%"],["Current Electricity","4%"],["Electromagnetism","6%"],["Electrons and Photons","4%"],["Atoms, Molecules and Nuclei","6%"],["Semiconductor","4%"],["Communication System","2%"]],
  Chemistry:[["Basic Concepts of Chemistry","2%"],["States of Matter","2%"],["Redox Reaction","2%"],["Surface Chemistry","2%"],["Nature of Chemical Bond","4%"],["Structure of Atom","2%"],["s-Block Elements","2%"],["Basic Principles of Organic Chemistry","2%"],["Alkanes","2%"],["Solid State","2%"],["Solutions & Colligative Properties","6%"],["Thermodynamics","8%"],["Electrochemistry","6%"],["Chemical Kinetics","8%"],["p-Block Elements","10%"],["d- and f-Block Elements","6%"],["Coordination Compounds","2%"],["Halogen Derivatives","6%"],["Alcohol, Phenol and Ether","4%"],["Aldehyde and Ketone","8%"],["Biomolecules","4%"],["Polymers","4%"],["Chemistry in Everyday Life","2%"]],
  Mathematics:[["Sets","2%"],["Relations and Functions","2%"],["Sequences and Series","4%"],["Probability","2%"],["Trigonometric Functions","6%"],["Straight Line","2%"],["Circle and Conics","4%"],["Mathematical Logic","6%"],["Matrices","4%"],["Differentiation & Applications","6%"],["Integration","11.2%"],["Three-Dimensional Geometry","11.2%"]]
 } as Record<string,string[][]>;
 const data=tab==="HSC"?hsc:cet;
 return <main className="syllabus-page"><div className="page-heading"><span className="section-kicker">STUDY PLAN / 04</span><h1>Syllabus</h1><p>Your HSC and MHT-CET PCM chapter map, with weightage in one place.</p></div>
 <div className="syllabus-tabs glass-pill"><button className={tab==="HSC"?"active-pill":""} onClick={()=>setTab("HSC")}>HSC</button><button className={tab==="MHT-CET"?"active-pill":""} onClick={()=>setTab("MHT-CET")}>MHT-CET</button></div>
 {tab==="MHT-CET"&&<div className="syllabus-note glass-panel"><b>PCM split</b><span>Current MHT-CET pattern uses roughly 20% Std. XI + 80% Std. XII curriculum. Chapter percentages below are planning estimates, not an official chapter-by-chapter guarantee.</span></div>}
 <div className="syllabus-grid">{(["Physics","Chemistry","Mathematics"] as const).map((subject,i)=><section className="syllabus-card glass-panel" key={subject}><div className="syllabus-card-head"><div><span className="section-kicker">0{i+1} / {tab}</span><h2>{subject}</h2></div><span>{data[subject].length} CHAPTERS</span></div><div className="syllabus-table"><div className="syllabus-row syllabus-header"><span>#</span><span>Chapter</span><span>{tab==="HSC"?"Marks":"Weight"}</span></div>{data[subject].map((x,j)=><div className="syllabus-row" key={x[0]}><span>{String(j+1).padStart(2,"0")}</span><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></section>)}</div>
 <div className="syllabus-foot"><span>HSC values are theory-paper planning weightage; * indicates marks-with-options style distribution.</span><span>Keep the full syllabus covered.</span></div>
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

function LoginPanel({onClose}:{onClose:()=>void}){const [user,setUser]=useState(""),[pass,setPass]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[logged,setLogged]=useState(false),[name,setName]=useState("");
 useEffect(()=>{fetch("/api/auth").then(r=>r.json()).then(x=>{setLogged(!!x.loggedIn);setName(x.username||"")}).catch(()=>{})},[]);
 async function login(){setBusy(true);setError("");try{const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user,password:pass})});const x=await r.json();if(!r.ok)throw new Error(x.error);setLogged(true);setName(x.username);window.dispatchEvent(new Event("studyx-login"))}catch(e){setError(e instanceof Error?e.message:"Login failed")}finally{setBusy(false)}}
 async function logout(){await fetch("/api/auth",{method:"DELETE"});setLogged(false);setName("");window.dispatchEvent(new Event("studyx-logout"))}
 return <div className="login-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="login-card glass-panel">{logged?<><span className="section-kicker">ACCOUNT / ACTIVE</span><h2>Welcome back.</h2><p className="login-user">@{name}</p><p>Your study progress is synced to your account and can follow you across devices.</p><button className="login-primary" onClick={onClose}>Continue to Study X</button><button className="login-secondary" onClick={logout}>Sign out</button></>:<><span className="section-kicker">STUDY X / ACCOUNT</span><h2>Sign in.</h2><p>Use the username and password issued for your Study X account.</p><label>USERNAME<input autoComplete="username" value={user} onChange={e=>setUser(e.target.value)} placeholder="Your username"/></label><label>PASSWORD<input autoComplete="current-password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password"/></label>{error&&<div className="login-error">{error}</div>}<button className="login-primary" disabled={busy||!user||!pass} onClick={login}>{busy?"Signing in…":"Sign in"}</button><button className="login-secondary" onClick={onClose}>Cancel</button></>}</section></div>}

function Progress(){
  const pathways=[["Fool","Seer"],["Door","Apprentice"],["Error","Marauder"],["Visionary","Spectator"],["Sun","Bard"],["Tyrant","Sailor"],["White Tower","Reader"],["Darkness","Sleepless"],["Death","Corpse Collector"]];
  const [seconds,setSeconds]=useState(0);
  const [sessions,setSessions]=useState(0);
  const [tasks,setTasks]=useState<{id:number;text:string;done:boolean}[]>([]);
  const [taskText,setTaskText]=useState("");
  const [selected,setSelected]=useState<string|null>(null);
  const [showPicker,setShowPicker]=useState(false);

  useEffect(()=>{
    const load=()=>{
      try{
        const d=JSON.parse(localStorage.getItem("study-x-progress")||"{}");
        setSeconds(d.seconds||0);
        setSessions(d.sessions||0);
        setSelected(d.pathway||null);
        const saved=JSON.parse(localStorage.getItem("study-x-tasks")||"[]");
        setTasks(Array.isArray(saved)?saved:[]);
      }catch{}
    };
    load();
    const id=setInterval(load,1000);
    return()=>clearInterval(id);
  },[]);

  const saveTasks=(next:{id:number;text:string;done:boolean}[])=>{
    setTasks(next);
    localStorage.setItem("study-x-tasks",JSON.stringify(next));
  };

  const addTask=()=>{
    const value=taskText.trim();
    if(!value)return;
    saveTasks([...tasks,{id:Date.now(),text:value,done:false}]);
    setTaskText("");
  };

  const choosePath=(name:string)=>{
    try{
      const d=JSON.parse(localStorage.getItem("study-x-progress")||"{}");
      d.pathway=name;
      d.sequence=d.sequence??9;
      localStorage.setItem("study-x-progress",JSON.stringify(d));
      setSelected(name);
      setShowPicker(false);
    }catch{}
  };

  const hours=seconds/3600;
  const wholeHours=Math.floor(hours);
  const mins=Math.floor((seconds%3600)/60);
  const display=wholeHours>0?wholeHours+"h "+mins+"m":mins>0?mins+"m":Math.floor(seconds)+"s";
  const sequence=selected?9:9;
  const thresholds=[0,20,45,80,125,185,260,350,460,600];
  const current=thresholds[9-sequence]||0;
  const next=thresholds[10-sequence]||20;
  const levelProgress=Math.min(100,Math.max(0,(hours-current)/(next-current)*100));
  const done=tasks.filter(t=>t.done).length;
  const goal=Math.min(100,seconds/14400*100);

  return (
    <main className="progress-page">
      <div className="progress-heading">
        <div><span className="section-kicker">PROGRESS / 02</span><h1>Your study progress.</h1><p>Choose a pathway, complete difficult challenges, and earn every sequence.</p></div>
        <div className="progress-live"><i/> LIVE TRACKING</div>
      </div>
      {!selected ? (
        <section className="pathway-select glass-panel">
          <div className="detail-head"><div><span className="section-kicker">BEGIN YOUR JOURNEY</span><h2>Choose your pathway.</h2><p>Pick one route. Your progression stays tied to it.</p></div><span>09 PATHWAYS</span></div>
          <div className="pathway-choice-grid">
            {pathways.map((p,i)=><button className="pathway-choice" key={p[0]} onClick={()=>choosePath(p[0])}><small>PATHWAY {String(i+1).padStart(2,"0")}</small><strong>{p[0]}</strong><span>{p[1]} route</span><b>BEGIN AT SEQ. 9 →</b></button>)}
          </div>
        </section>
      ) : (
        <>
          <section className="progress-hero glass-panel"><div><span className="progress-label">TOTAL STUDY TIME / {selected.toUpperCase()}</span><strong>{display}</strong><p>You have studied for <b>{wholeHours} hour{wholeHours===1?"":"s"}</b>. Current rank: <b>Sequence {sequence}</b>.</p></div><div className="progress-orb"><span>SEQ {sequence}</span><small>{Math.round(levelProgress)}% to next</small></div></section>
          <section className="sequence-panel glass-panel">
            <div className="detail-head"><div><span className="section-kicker">PATHWAY / {selected.toUpperCase()}</span><h2>Sequence progression</h2><p>Advancement gets harder at every step.</p></div><button className="switch-path-btn" onClick={()=>setShowPicker(v=>!v)}>SWITCH PATHWAY</button></div>
            <div className="sequence-ladder">{[9,8,7,6,5,4,3,2,1,0].map(seq=><div className={"seq-node "+(seq===sequence?"current":"locked")} key={seq}><span>SEQ {seq}</span><div><b>{seq===9?"Entry":seq===8?"Early development":seq===7?"Specialization":seq===6?"Advanced focus":seq===5?"High mastery":seq===4?"Demigod threshold":seq===3?"Saint tier":seq===2?"Angel tier":seq===1?"Attendant tier":"Apex"}</b><small>{seq===sequence?"CURRENT":"LOCKED"} · {thresholds[9-seq]||0}h required</small></div><strong>{seq===sequence?"ACTIVE":"LOCKED"}</strong></div>)}</div>
            <div className="sequence-goal"><div><span>NEXT ADVANCEMENT</span><b>{Math.max(0,Math.ceil(next-hours))} hours remaining</b><small>Requires sustained study plus pathway challenges.</small></div><div className="goal-track"><i style={{width:levelProgress+"%"}}/></div></div>
          </section>
          {showPicker&&<section className="pathway-select glass-panel"><div className="detail-head"><div><span className="section-kicker">PATHWAY CONTROL</span><h2>Choose another route.</h2></div></div><div className="pathway-choice-grid compact">{pathways.map(p=><button className={"pathway-choice "+(p[0]===selected?"selected":"")} key={p[0]} onClick={()=>p[0]!==selected&&choosePath(p[0])}><small>PATHWAY</small><strong>{p[0]}</strong><span>{p[1]} route</span></button>)}</div></section>}
        </>
      )}
      <div className="progress-stats"><article className="glass-panel"><span>HOURS STUDIED</span><b>{wholeHours}</b><small>total focused hours</small></article><article className="glass-panel"><span>FOCUSED MINUTES</span><b>{Math.floor(seconds/60).toLocaleString()}</b><small>minutes accumulated</small></article><article className="glass-panel"><span>SESSIONS</span><b>{sessions}</b><small>completed sessions</small></article></div>
      <div className="progress-work-grid">
        <section className="progress-tasks glass-panel"><div className="detail-head"><div><span className="section-kicker">WORKSPACE / TASKS</span><h2>Today&apos;s tasks</h2></div><span>{done}/{tasks.length}</span></div><form className="task-add" onSubmit={e=>{e.preventDefault();addTask()}}><input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="Add a study task..." aria-label="Add a study task"/><button type="submit">ADD</button></form><div className="task-items">{tasks.length===0?<div className="task-empty">Add tasks here and tick them off as you study.</div>:tasks.map(t=><div className={"task-item "+(t.done?"done":"")} key={t.id}><button type="button" className="task-check" onClick={()=>saveTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done?"✓":""}</button><span>{t.text}</span><button type="button" className="task-delete" onClick={()=>saveTasks(tasks.filter(x=>x.id!==t.id))}>×</button></div>)}</div></section>
        <section className="progress-detail glass-panel"><div className="detail-head"><div><span className="section-kicker">CONSISTENCY</span><h2>Daily goal</h2></div><span>{Math.round(goal)}% of 4h goal</span></div><div className="big-progress-track"><div style={{width:goal+"%"}}/></div><div className="detail-foot"><span>0h</span><b>{display}</b><span>4h</span></div></section>
      </div>
    </main>
  );
}

export default function Page(){
 const path=usePathname(),router=useRouter(),[loginOpen,setLoginOpen]=useState(false),[account,setAccount]=useState<string|null>(null),isAch=path==="/achievements",isProgress=path==="/progress",isSyllabus=path==="/syllabus";
 useEffect(()=>{const f=()=>fetch("/api/auth").then(r=>r.json()).then(x=>setAccount(x.loggedIn?x.username:null)).catch(()=>{});f();window.addEventListener("studyx-login",f);window.addEventListener("studyx-logout",f);return()=>{window.removeEventListener("studyx-login",f);window.removeEventListener("studyx-logout",f)}},[]);
 const nav=["Timer","Progress","Syllabus","Leaderboard"],routes:Record<string,string>={Timer:"/timer",Progress:"/progress",Syllabus:"/syllabus",Leaderboard:"/leaderboard"};
 return <div className="study-x-app"><div className="grain"/><div className="ambient-glow"/>
 <nav className="top-nav"><button className="brand" onClick={()=>router.push("/timer")}><span className="brand-mark">SX</span><b>Study<span> X</span></b></button><div className="nav-pill glass-pill">{nav.map(n=><button key={n} onClick={()=>{if(path!==routes[n]) router.push(routes[n])}} className={(n==="Progress" && isProgress) || (n==="Syllabus" && isSyllabus) || (n==="Timer" && path==="/timer") ? "active-pill" : ""}>{n}</button>)}</div><div className="nav-right"><button className="nav-action" aria-label="Notifications">•••</button><button className="login-nav" onClick={()=>setLoginOpen(true)}>{account?"@"+account:"Login"}</button></div></nav>
 <div className="content">{isAch?<Achievements/>:isProgress?<Progress/>:isSyllabus?<Syllabus/>:<Timer/>}</div>{loginOpen&&<LoginPanel onClose={()=>setLoginOpen(false)}/>}<div className="status-bar"><span><i/> Systems normal</span><span>Study X · 2026</span></div></div>
}