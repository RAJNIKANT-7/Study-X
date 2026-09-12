"use client";
import {useMemo,useState} from "react";
type Achievement={icon:string;title:string;description:string;category:string;unlocked:boolean;xp:number;progress?:number;total?:number};
const cats=["All","Streaks","Study Hours","Sessions","Social","Special"];
const data:Achievement[]=[
{icon:"🌱",title:"First Step",description:"Complete your very first study session",category:"Sessions",unlocked:true,xp:50},
{icon:"🔥",title:"On a Roll",description:"Maintain a 3-day study streak",category:"Streaks",unlocked:true,xp:100},
{icon:"⚔️",title:"Week Warrior",description:"Study every day for 7 consecutive days",category:"Streaks",unlocked:true,xp:250},
{icon:"💯",title:"Century Club",description:"Log 100 total study hours",category:"Study Hours",unlocked:true,xp:500},
{icon:"🦉",title:"Night Owl",description:"Study after midnight 10 times",category:"Special",unlocked:true,xp:200},
{icon:"🌅",title:"Early Bird",description:"Start a session before 6am on 5 different days",category:"Special",unlocked:true,xp:200},
{icon:"🦋",title:"Social Butterfly",description:"Join 3 different study groups",category:"Social",unlocked:true,xp:150},
{icon:"🏆",title:"Iron Discipline",description:"Study for 30 consecutive days",category:"Streaks",unlocked:false,xp:1000,progress:18,total:30},
{icon:"⚡",title:"Half Millennium",description:"Log 500 total study hours",category:"Study Hours",unlocked:false,xp:1500,progress:247,total:500},
{icon:"🎯",title:"Session Master",description:"Complete 200 study sessions",category:"Sessions",unlocked:false,xp:600,progress:134,total:200},
{icon:"👑",title:"Leaderboard Legend",description:"Reach the top 3 on the global leaderboard",category:"Social",unlocked:false,xp:2000,progress:0,total:1},
{icon:"🍅",title:"Pomodoro Pro",description:"Complete 500 Pomodoro sessions",category:"Sessions",unlocked:false,xp:800,progress:89,total:500},
{icon:"🌟",title:"Millennium",description:"Log 1000 total study hours",category:"Study Hours",unlocked:false,xp:5000,progress:247,total:1000},
{icon:"🤝",title:"Study Buddy",description:"Study in a group session 25 times",category:"Social",unlocked:false,xp:400,progress:11,total:25},
{icon:"🧘",title:"Deep Focus",description:"Complete a 4-hour uninterrupted session",category:"Special",unlocked:false,xp:1000,progress:0,total:1},
{icon:"📅",title:"Consistency King",description:"Study at the same time every day for 2 weeks",category:"Streaks",unlocked:false,xp:350,progress:5,total:14}];
export default function Achievements(){const[cat,setCat]=useState("All");const list=useMemo(()=>cat==="All"?data:data.filter(a=>a.category===cat),[cat]);const unlocked=data.filter(a=>a.unlocked).length;const xp=data.filter(a=>a.unlocked).reduce((s,a)=>s+a.xp,0);return <main className="achievements-page"><div className="page-heading"><h1>Achievements</h1><p>Track your milestones and earn XP as you study</p></div><div className="stats-grid">{[["🏅",unlocked+"/"+data.length,"Unlocked"],["⚡",xp.toLocaleString(),"Total XP"],["🔥","18 days","Current Streak"],["⏱️","247 h","Study Hours"]].map(x=><div className="stat-card" key={x[2]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}</div><div className="category-filters">{cats.map(c=><button className={cat===c?"active-filter":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div><div className="result-line"><span>{list.filter(a=>a.unlocked).length} unlocked · {list.filter(a=>!a.unlocked).length} locked</span><i/></div><div className="achievement-grid">{list.map(a=>{const pct=a.progress!=null&&a.total?Math.min(100,a.progress/a.total*100):0;return <article className="achievement-card" key={a.title}><div className="achievement-top"><div className="achievement-icon">{a.icon}</div><span className="rarity">{a.unlocked?"Unlocked":"Locked"}</span></div><div><h3>{a.title}</h3><p>{a.description}</p></div><div className="achievement-footer">{a.unlocked?<><span>Completed</span><b>+{a.xp} XP</b></>:<><span>{a.progress} / {a.total}</span><div className="progress-track"><div style={{width:pct+"%"}}/></div><span>+{a.xp} XP</span></>}</div></article>})}</div></main>}