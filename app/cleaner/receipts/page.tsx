import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyCleanerSession } from "@/lib/session-utils"
import { CleanerHeader } from "@/components/cleaner-header"
import { CleanerReceipts } from "@/components/cleaner-receipts"

export default async function CleanerReceiptsLayout({
  children,
}: {    
    children: React.ReactNode   
}) {
  const cookieStore = await cookies()
  const cleanerSession = cookieStore.get("cleaner_session")?.value  
    console.log("🔍 Checking cleaner session in RECEIPTS layout...")
    if (!cleanerSession) {
        console.log("❌ No cleaner session found, redirecting to login")
        redirect("/cleaner/login?message=Please login to access receipts")
    }

    const cleanerData = await verifyCleanerSession(cleanerSession)
    if (!cleanerData) { 
        console.log("❌ Invalid cleaner session, redirecting to login")
        redirect("/cleaner/login?message=Session expired. Please login again.")
    }
    console.log("✅ Cleaner session valid for:", cleanerData.email)
    return (
        <div className="min-h-screen bg-background">
            <CleanerHeader cleanerData={cleanerData} />
            <div className="container mx-auto p-4 lg:p-6">
                <div className="mb-6">
                    <h1 className="font-serif font-bold text-3xl text-primary mb-2">Receipts</h1>
                    <p className="text-muted-foreground">View and manage your cleaning service receipts</p>
                </div>
               <CleanerReceipts />
            </div>
        </div>
    )
}   