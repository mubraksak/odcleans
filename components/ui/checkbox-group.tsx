// components/ui/checkbox-group.tsx
"use client"

import { CheckboxField } from "@/components/ui/checkbox-field"
import { cn } from "@/lib/utils"

export interface CheckboxOption {
  id: string
  label: string
  value: string
  description?: string
  disabled?: boolean
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  selectedValues: string[]
  onValueChange: (values: string[]) => void
  className?: string
  legend?: string
}

export function CheckboxGroup({
  options,
  selectedValues,
  onValueChange,
  className,
  legend,
}: CheckboxGroupProps) {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onValueChange([...selectedValues, value])
    } else {
      onValueChange(selectedValues.filter(v => v !== value))
    }
  }

  return (
    <fieldset className={cn("space-y-4", className)}>
      {legend && (
        <legend className="text-sm font-medium text-foreground mb-3">
          {legend}
        </legend>
      )}
      <div className="space-y-3">
        {options.map((option) => (
          <CheckboxField
            key={option.id}
            id={option.id}
            label={option.label}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
            disabled={option.disabled}
            description={option.description}
          />
        ))}
      </div>
    </fieldset>
  )
}