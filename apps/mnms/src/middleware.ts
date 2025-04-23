import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@mnms/db";


type Session = typeof auth.$Infer.Session;
const publicPaths = ['/login', '/onboarding']
export default async function authMiddleware(request: NextRequest) {
	const { data: session,error } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				//get the cookie from the request
				cookie: request.headers.get("cookie") || "",
			},
		},
	);

	if (error) { 
		return NextResponse.redirect(new URL("/not-found", request.url));
	}
	try{
	if (!session) {
		const user = await db.query.user.findFirst()
		
		if (!user && request.nextUrl.pathname !== "/onboarding") {
			return NextResponse.redirect(new URL("/onboarding", request.url));
		}

		if (!publicPaths.includes(request.nextUrl.pathname)) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
		
	}

	return NextResponse.next();
	}catch{
		return NextResponse.redirect(new URL("/not-found", request.url));
	}
}
 

export const config = {
	matcher: ['/((?!api|not-found|_next/static|_next/image|favicon.ico|placeholder.webp).*)'],
};