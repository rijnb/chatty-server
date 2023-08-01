import type {NextRequest} from "next/server"
import {NextResponse} from "next/server"
import {auth} from "@/utils/auth"


export default function middleware(req: NextRequest) {
  const authResult = auth(req)
  if (authResult.error) {
    return new NextResponse("Error: You are not authorized to use the service. Check your Unlock code.", {
      ...authResult
    })
  }
}

export const config = {
  matcher: [
    "/api/(.*)" // match all API routes
  ]
}
