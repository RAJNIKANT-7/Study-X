import {NextRequest,NextResponse} from "next/server";
export function middleware(req:NextRequest){const session=req.cookies.get("study_x_session")?.value;if(session)return NextResponse.next();return NextResponse.redirect(new URL("/login",req.url));}
export const config={matcher:["/","/timer/:path*","/progress/:path*","/syllabus/:path*","/leaderboard/:path*","/achievements/:path*"]};
