// import { type NextRequest, NextResponse } from "next/server"
// import { query } from "@/lib/database"
// import { cookies } from "next/headers"
// import { generateToken } from "@/lib/auth-utils"
// import bcrypt from "bcryptjs"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
//     }

//     // Find admin user
//     const admins = (await query("SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE", [email])) as any[]

//     if (admins.length === 0) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     const admin = admins[0]


//     // Verify password (in production, use proper bcrypt comparison)
//     // For demo purposes, we'll use a simple comparison
//     const isValidPassword = password === "admin123" // Replace with bcrypt.compare(password, admin.password_hash)

//     if (!isValidPassword) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Create admin session
//     const sessionToken = generateToken()
//     const sessionExpires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

//     // Store session (you might want a separate admin_sessions table)
//     await query("UPDATE admin_users SET session_token = ?, session_expires = ? WHERE id = ?", [
//       sessionToken,
//       sessionExpires,
//       admin.id,
//     ])

//     // Set cookie
//     const cookieStore = await cookies()
//     cookieStore.set("admin_session", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       expires: sessionExpires,
//     })

//     return NextResponse.json({
//       success: true,
//       admin: {
//         id: admin.id,
//         email: admin.email,
//         name: admin.name,
//         role: admin.role,
//       },
//     })
//   } catch (error) {
//     console.error("Error in admin auth:", error)
//     return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
//   }
// }


// import { type NextRequest, NextResponse } from "next/server"
// import { query } from "@/lib/database"
// import { cookies } from "next/headers"
// import { generateToken } from "@/lib/auth-utils"
// import bcrypt from "bcryptjs"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
//     }

//     // Find admin user
//     const admins = (await query(
//       "SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE", 
//       [email]
//     )) as any[]

//     if (admins.length === 0) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     const admin = admins[0]

//     // Verify password with proper bcrypt comparison
//     const isValidPassword = await bcrypt.compare(password, admin.password_hash)

//     if (!isValidPassword) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Create admin session
//     const sessionToken = generateToken()
//     const sessionExpires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

//     // Store session (you might want a separate admin_sessions table)
//     await query(
//       "UPDATE admin_users SET session_token = ?, session_expires = ? WHERE id = ?", 
//       [sessionToken, sessionExpires, admin.id]
//     )

//     // Set cookie
//     const cookieStore = await cookies()
//     cookieStore.set("admin_session", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       expires: sessionExpires,
//     })

//     return NextResponse.json({
//       success: true,
//       admin: {
//         id: admin.id,
//         email: admin.email,
//         name: admin.name,
//         role: admin.role,
//       },
//     })
//   } catch (error) {
//     console.error("Error in admin auth:", error)
//     return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
//   }
// }


// app/api/admin/login/route.ts (updated)
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin user
    const admins = (await query(
      "SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE", 
      [email]
    )) as any[]

    if (admins.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const admin = admins[0]

    // Verify password with proper bcrypt comparison
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create admin session
    const sessionToken = generateToken()
    const sessionExpires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

    // Store session
    await query(
      "UPDATE admin_users SET session_token = ?, session_expires = ? WHERE id = ?", 
      [sessionToken, sessionExpires, admin.id]
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpires,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Error in admin auth:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}