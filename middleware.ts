import {NextRequest,NextResponse} from "next/server";
import crypto from "crypto";
function secret(){return process.env.STUDY_X_AUTH_SECRET||"dev-only-change-me"}
function valid(req:NextRequest){const t=req.cookies.get("study_x_session")?.value;if(!t)return false;const [p,s]=t.split(".");if(!p||!s)return false;const expected=crypto.createHmac("sha256",secret()).update(p).digest("hex");if(s.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return false;try{return JSON.parse(Buffer.from(p,"base64url").toString()).exp>Date.now()}catch{return false}}
export function middleware(req:NextRequest){if(valid(req))return NextResponse.next();return NextResponse.redirect(new URL("/login",req.url))}
export const config={matcher:["/","/timer/:path*","/progress/:path*","/syllabus/:path*","/leaderboard/:path*","/achievements/:path*"]};
