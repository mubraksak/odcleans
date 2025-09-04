import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-md mx-auto px-6">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
