import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface AnimatedListProps {
  className?: string
  children: React.ReactNode
  delay?: number
}

export function AnimatedList({
  className,
  children,
  delay = 1000,
}: AnimatedListProps) {
  const [items, setItems] = useState<React.ReactNode[]>([])
  const childrenArray = React.Children.toArray(children)

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        if (prev.length < childrenArray.length) {
          return [...prev, childrenArray[prev.length]]
        }
        clearInterval(interval)
        return prev
      })
    }, delay)

    return () => clearInterval(interval)
  }, [childrenArray, delay])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AnimatePresence>
        {items.map((item, index) => (
          <AnimatedListItem key={index}>{item}</AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface AnimatedListItemProps {
  children: React.ReactNode
}

export function AnimatedListItem({ children }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 40,
      }}
    >
      {children}
    </motion.div>
  )
}

// Variant that shows all items with staggered animation
interface AnimatedListAllProps {
  className?: string
  children: React.ReactNode
}

export function AnimatedListAll({ className, children }: AnimatedListAllProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 40,
            delay: index * 0.1,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

