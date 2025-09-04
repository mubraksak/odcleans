// components/ui/checkbox-field.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CheckboxFieldProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
  description?: string
}

export function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
  className,
  disabled = false,
  description,
}: CheckboxFieldProps) {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}