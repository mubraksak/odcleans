"use client"

import * as React from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  activeItem: string | null
  setActiveItem: (value: string | null) => void
}>({
  activeItem: null,
  setActiveItem: () => {},
})

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  type?: "single" | "multiple"
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ defaultValue = null, type = "single", className, children, ...props }, ref) => {
    const [activeItem, setActiveItem] = React.useState<string | null>(defaultValue)

    return (
      <AccordionContext.Provider value={{ activeItem, setActiveItem }}>
        <div
          ref={ref}
          className={cn("w-full rounded-md border border-border/50 bg-background", className)}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { type } as any)
            }
            return child
          })}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  className?: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border-b border-border/50 last:border-b-0", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { activeItem, setActiveItem } = React.useContext(AccordionContext)
    const itemValue = React.useRef<string>(Math.random().toString(36).substring(2, 9)).current

    const isActive = activeItem === itemValue

    const toggleItem = () => {
      setActiveItem(isActive ? null : itemValue)
    }

    return (
      <button
        ref={ref}
        onClick={toggleItem}
        className={cn(
          "flex w-full items-center justify-between py-4 px-6 text-left font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { activeItem } = React.useContext(AccordionContext)
    const itemValue = React.useRef<string>(Math.random().toString(36).substring(2, 9)).current

    const isActive = activeItem === itemValue

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all",
          isActive ? "animate-accordion-down" : "animate-accordion-up"
        )}
        style={{ height: isActive ? "auto" : 0 }}
        {...props}
      >
        <div className={cn("pb-4 pt-0 px-6", className)}>{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }