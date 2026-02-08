"use client"

import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar"
import "./page-loader.css"

export function PageLoader() {
  const { isLoading } = useSidebar()
  return <div className={cn("page-loader", { "is-loading": isLoading })} />
}
