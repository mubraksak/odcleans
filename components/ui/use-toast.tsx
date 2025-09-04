import { useState } from 'react'

interface Toast {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (toast: Toast) => {
    setToast(toast)
    setTimeout(() => setToast(null), 3000)
  }

  return { toast, showToast }
}

// Simple toast component
export function toast({ toast }: { toast: Toast | null }) {
  if (!toast) return null

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md ${
      toast.variant === 'destructive' ? 'bg-red-100 border-red-200 text-red-800' : 'bg-green-100 border-green-200 text-green-800'
    } border`}>
      <h4 className="font-semibold">{toast.title}</h4>
      <p className="text-sm">{toast.description}</p>
    </div>
  )
}